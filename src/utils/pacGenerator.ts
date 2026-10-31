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
      }
    }

    // AutoProxy list snippet
    let ruleListSnippet = '';
    if (sw.ruleListConfig?.enabled && sw.ruleListConfig.rulesText) {
      const targetProf = allProfiles.find(p => p.id === sw.ruleListConfig?.profileId);
      const listRet = targetProf ? formatPacStatement(targetProf) : 'DIRECT';
      const sampleDomains = sw.ruleListConfig.rulesText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('||'))
        .map(l => sanitizeToAscii(l.slice(2).replace(/^\/+/, '')))
        .filter(Boolean)
        .slice(0, 30);

      ruleListSnippet = `
  // Online Rule List items
  var ruleListDomains = ${JSON.stringify(sampleDomains)};
  for (var i = 0; i < ruleListDomains.length; i++) {
    var d = ruleListDomains[i];
    if (host === d || dnsDomainIs(host, "." + d)) {
      return "${listRet}";
    }
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

// Fallback helper in case browser engine lacks dnsDomainIs
function dnsDomainIs(host, domain) {
  return host.length >= domain.length && host.substring(host.length - domain.length) === domain;
}
`;
  }

  return `function FindProxyForURL(url, host) { return "DIRECT"; }`;
}
