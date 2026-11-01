import { Profile, FixedProfile, SwitchProfile } from '../types/omega';
import { formatPacStatement } from './matcher';

/**
 * Ensures a string contains ONLY pure ASCII characters (charCode <= 127).
 * Chromium chrome.proxy.settings STRICTLY errors if pacScript.data contains non-ASCII characters.
 */
export function sanitizeToAscii(str: string): string {
  return str.replace(/[^\x00-\x7F]/g, '');
}

/**
 * Generates RFC-compliant, standard JavaScript FindProxyForURL PAC script.
 * Guaranteed to be 100% pure ASCII to comply with Chromium PAC specifications.
 */
export function generatePacScript(profile: Profile, allProfiles: Profile[]): string {
  if (profile.profileType === 'PacProfile' && profile.pacScript) {
    return sanitizeToAscii(profile.pacScript);
  }

  if (profile.profileType === 'DirectProfile') {
    return `// ProxyPilot PAC Script - Direct Connection
function FindProxyForURL(url, host) {
  return "DIRECT";
}`;
  }

  if (profile.profileType === 'SystemProfile') {
    return `// ProxyPilot PAC Script - System Proxy
function FindProxyForURL(url, host) {
  return "SYSTEM";
}`;
  }

  if (profile.profileType === 'FixedProfile') {
    const fixed = profile as FixedProfile;
    const pacRet = formatPacStatement(fixed);
    const bypassLines = fixed.bypassList
      .filter(b => b.enabled)
      .map(b => {
        const cleanPattern = sanitizeToAscii(b.pattern);
        if (cleanPattern === '<local>') {
          return `  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost") return "DIRECT";`;
        }
        if (cleanPattern.includes('*') || cleanPattern.includes('?')) {
          return `  if (shExpMatch(host, "${cleanPattern}") || shExpMatch(url, "${cleanPattern}")) return "DIRECT";`;
        }
        return `  if (host === "${cleanPattern}") return "DIRECT";`;
      })
      .join('\n');

    const cleanId = sanitizeToAscii(fixed.id);

    return `// ProxyPilot PAC Script - Fixed Proxy [${cleanId}]
// Generated at: ${new Date().toISOString()}

function FindProxyForURL(url, host) {
  // Bypass conditions
${bypassLines || '  // No bypass rules configured'}

  // Default proxy endpoint
  return "${pacRet}";
}`;
  }

  if (profile.profileType === 'SwitchProfile') {
    const sw = profile as SwitchProfile;
    const defProf = allProfiles.find(p => p.id === sw.defaultProfileId) || allProfiles.find(p => p.id === 'direct');
    const defaultPacRet = defProf ? formatPacStatement(defProf) : 'DIRECT';

    const ruleCodeBlocks: string[] = [];

    for (let i = 0; i < sw.rules.length; i++) {
      const rule = sw.rules[i];
      if (!rule.enabled) continue;
      const targetProf = allProfiles.find(p => p.id === rule.profileId);
      const targetRet = targetProf ? formatPacStatement(targetProf) : 'DIRECT';
      
      // Keep notes strictly ASCII or use rule index comment
      const asciiNote = rule.note ? sanitizeToAscii(rule.note) : '';
      const comment = asciiNote ? `  // Rule ${i + 1}: ${asciiNote}` : `  // Rule ${i + 1}`;
      const cleanPattern = sanitizeToAscii(rule.pattern);

      if (rule.conditionType === 'HostWildcardCondition') {
        ruleCodeBlocks.push(`${comment}\n  if (shExpMatch(host, "${cleanPattern}")) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'UrlWildcardCondition') {
        ruleCodeBlocks.push(`${comment}\n  if (shExpMatch(url, "${cleanPattern}")) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'HostRegexCondition') {
        ruleCodeBlocks.push(`${comment}\n  if (/${cleanPattern}/i.test(host)) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'UrlRegexCondition') {
        ruleCodeBlocks.push(`${comment}\n  if (/${cleanPattern}/i.test(url)) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'KeywordCondition') {
        ruleCodeBlocks.push(`${comment}\n  if (url.indexOf("${cleanPattern}") !== -1 || host.indexOf("${cleanPattern}") !== -1) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'IpCidrCondition') {
        const parts = cleanPattern.split('/');
        const cidrIp = parts[0]?.trim() || '';
        const cidrPrefix = parseInt(parts[1]?.trim() || '32', 10);
        const p = Math.max(0, Math.min(32, cidrPrefix));
        const maskArr = [];
        let rem = p;
        for (let mi = 0; mi < 4; mi++) {
          const n = Math.min(rem, 8);
          maskArr.push(256 - Math.pow(2, 8 - n));
          rem -= n;
        }
        const cidrMask = maskArr.join('.');
        ruleCodeBlocks.push(`${comment}\n  if (isInNet(dnsResolve(host), "${cidrIp}", "${cidrMask}")) {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'PortCondition') {
        const portStr = cleanPattern.replace(/^:/, '').trim();
        ruleCodeBlocks.push(`${comment}\n  var pMatch = (url.match(/:([0-9]+)/) || [])[1];\n  if (pMatch === "${portStr}") {\n    return "${targetRet}";\n  }`);
      } else if (rule.conditionType === 'SchemeCondition') {
        const schemeStr = cleanPattern.replace(/:$/, '').trim().toLowerCase();
        ruleCodeBlocks.push(`${comment}\n  if (url.indexOf("${schemeStr}:") === 0) {\n    return "${targetRet}";\n  }`);
      }
    }

    // AutoProxy / GFWList segment (Fast hash table lookup + whitelist support)
    let ruleListSnippet = '';
    if (sw.ruleListConfig?.enabled && sw.ruleListConfig.rulesText) {
      const targetProf = allProfiles.find(p => p.id === sw.ruleListConfig?.profileId);
      const listRet = targetProf ? formatPacStatement(targetProf) : 'DIRECT';

      const lines = sw.ruleListConfig.rulesText.split(/\r?\n/);
      const proxyMap: Record<string, number> = {};
      const whiteMap: Record<string, number> = {};

      for (let li = 0; li < lines.length; li++) {
        const l = lines[li].trim();
        if (!l || l.startsWith('!') || l.startsWith('[')) continue;
        if (l.startsWith('@@')) {
          const clean = sanitizeToAscii(l.replace(/^@@(\|\|)?/, '').replace(/^https?:\/\//, '').split('/')[0].trim().toLowerCase());
          if (clean && !clean.includes('*') && !clean.includes('^')) whiteMap[clean] = 1;
        } else if (l.startsWith('||')) {
          const clean = sanitizeToAscii(l.slice(2).replace(/^\/+/, '').split('/')[0].trim().toLowerCase());
          if (clean && !clean.includes('*') && !clean.includes('^')) proxyMap[clean] = 1;
        } else if (!l.startsWith('|') && !l.startsWith('/') && l.includes('.') && !l.includes(' ') && !l.includes('*')) {
          const clean = sanitizeToAscii(l.split('/')[0].trim().toLowerCase());
          if (clean) proxyMap[clean] = 1;
        }
      }

      ruleListSnippet = `
  // --- GFWList / Online Rule List Matcher ---
  var gfwWhite = ${JSON.stringify(whiteMap)};
  var gfwProxy = ${JSON.stringify(proxyMap)};
  if (matchDomainMap(host, gfwWhite)) {
    return "DIRECT";
  }
  if (matchDomainMap(host, gfwProxy)) {
    return "${listRet}";
  }`;
    }

    const cleanId = sanitizeToAscii(sw.id);

    return `// ProxyPilot PAC Script - Auto Switch [${cleanId}]
// Standard FindProxyForURL compliant with Chromium, Firefox, WebKit (Strict ASCII)

function FindProxyForURL(url, host) {
  // Built-in local exclusions
  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1") {
    return "DIRECT";
  }

  // --- Custom Switch Rules ---
${ruleCodeBlocks.join('\n\n')}
${ruleListSnippet}

  // --- Default Fallback ---
  return "${defaultPacRet}";
}

// Fast domain lookup supporting exact and subdomain matches
function matchDomainMap(h, map) {
  if (!h || !map) return false;
  h = h.toLowerCase();
  if (map[h]) return true;
  var dot = h.indexOf('.');
  while (dot !== -1) {
    var parent = h.substring(dot + 1);
    if (map[parent]) return true;
    dot = h.indexOf('.', dot + 1);
  }
  return false;
}
`;
  }

  return `function FindProxyForURL(url, host) { return "DIRECT"; }`;
}
