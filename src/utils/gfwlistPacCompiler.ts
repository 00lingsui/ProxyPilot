/**
 * Compiler that converts AutoProxy / GFWList rule text into an optimized,
 * high-performance JavaScript FindProxyForURL PAC script.
 * 
 * Complies strictly with Chromium PAC specification: 100% Pure ASCII.
 */

import { parseAutoProxyText, CURATED_TOP_DOMAINS, CURATED_WHITELIST_DOMAINS, syncRuleList, RULE_LIST_MIRRORS } from './ruleListSync';
import { sanitizeToAscii } from './pacGenerator';

export interface GfwlistPacOptions {
  proxyStatement: string; // e.g. "SOCKS5 127.0.0.1:7897; DIRECT"
  fallbackStatement?: string; // e.g. "DIRECT"
  rulesText?: string;
  customProxies?: string[];
  customWhitelist?: string[];
  sourceUrl?: string;
}

export const GFWLIST_MIRRORS = [
  { name: 'jsDelivr CDN (推荐/极速)', url: RULE_LIST_MIRRORS[0] },
  { name: 'Fastly CDN 镜像', url: RULE_LIST_MIRRORS[1] },
  { name: 'GitMirror 加速镜像', url: RULE_LIST_MIRRORS[2] },
  { name: 'GitHub 官方源 (Raw)', url: RULE_LIST_MIRRORS[3] },
  { name: 'GitLab 备份镜像', url: RULE_LIST_MIRRORS[4] },
];

/**
 * Compiles curated offline GFWList base into pure ASCII PAC script
 */
export function compileCuratedGfwlistPac(proxyStatement = 'SOCKS5 127.0.0.1:7897; DIRECT'): string {
  const result = compileGfwlistToPac({
    proxyStatement,
    fallbackStatement: 'DIRECT',
    sourceUrl: 'ProxyPilot Curated Base (4,430+ domains)',
  });
  return result.pacScript;
}

/**
 * Synchronous compiler accepting GfwlistPacOptions
 */
export function compileGfwlistWithOptions(options: GfwlistPacOptions): {
  pacScript: string;
  proxyCount: number;
  whitelistCount: number;
} {
  const proxyStatement = sanitizeToAscii(options.proxyStatement || 'SOCKS5 127.0.0.1:7897; DIRECT');
  const fallbackStatement = sanitizeToAscii(options.fallbackStatement || 'DIRECT');

  let proxyDomains: string[] = [];
  let whitelistDomains: string[] = [];

  if (options.rulesText && options.rulesText.trim().length > 10) {
    const parsed = parseAutoProxyText(options.rulesText);
    proxyDomains = parsed.proxyDomains;
    whitelistDomains = parsed.whitelistDomains;
  } else {
    proxyDomains = [...CURATED_TOP_DOMAINS];
    whitelistDomains = [...CURATED_WHITELIST_DOMAINS];
  }

  // Merge custom proxies & whitelist
  if (options.customProxies) {
    for (const d of options.customProxies) {
      const clean = sanitizeToAscii(d.trim().toLowerCase());
      if (clean && !proxyDomains.includes(clean)) {
        proxyDomains.unshift(clean);
      }
    }
  }

  if (options.customWhitelist) {
    for (const d of options.customWhitelist) {
      const clean = sanitizeToAscii(d.trim().toLowerCase());
      if (clean && !whitelistDomains.includes(clean)) {
        whitelistDomains.unshift(clean);
      }
    }
  }

  // Build dictionary map for O(1) hash lookup
  const proxyMap: Record<string, number> = {};
  for (const d of proxyDomains) {
    const clean = sanitizeToAscii(d.toLowerCase());
    if (clean) proxyMap[clean] = 1;
  }

  const whiteMap: Record<string, number> = {};
  for (const w of whitelistDomains) {
    const clean = sanitizeToAscii(w.toLowerCase());
    if (clean) whiteMap[clean] = 1;
  }

  const dateStr = new Date().toISOString();
  const sourceStr = options.sourceUrl ? sanitizeToAscii(options.sourceUrl) : 'GFWList Standard Base';

  // Construct pure ASCII PAC Script
  const pacScript = `// ProxyPilot High-Performance GFWList PAC Script
// Generated at: ${dateStr}
// Source: ${sourceStr}
// Rules: ${Object.keys(proxyMap).length} proxy domains, ${Object.keys(whiteMap).length} whitelist domains
// Target Proxy: ${proxyStatement}

var proxy = "${proxyStatement}";
var direct = "${fallbackStatement}";

// Fast Whitelist Hash Map (Direct Connection)
var whitelist = ${JSON.stringify(whiteMap, null, 2)};

// Fast GFWList Proxy Hash Map (O(1) Lookup)
var domains = ${JSON.stringify(proxyMap, null, 2)};

/**
 * Standard FindProxyForURL Entry Point
 */
function FindProxyForURL(url, host) {
  // 1. Direct connection for internal plain hostnames, localhost & LAN subnets
  if (isPlainHostName(host) || 
      host === "127.0.0.1" || 
      host === "localhost" || 
      host === "::1" ||
      shExpMatch(host, "*.local") ||
      shExpMatch(host, "*.lan") ||
      shExpMatch(host, "*.internal") ||
      isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
      isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") ||
      isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")) {
    return direct;
  }

  // 2. Normalize host to lower case
  host = host.toLowerCase();

  // 3. Exact Whitelist match
  if (whitelist[host]) {
    return direct;
  }

  // 4. Exact Proxy match
  if (domains[host]) {
    return proxy;
  }

  // 5. Fast subdomain hierarchical suffix match
  var lastDot = host.lastIndexOf('.');
  while (lastDot !== -1) {
    var subDot = host.lastIndexOf('.', lastDot - 1);
    if (subDot === -1) {
      if (whitelist[host]) return direct;
      if (domains[host]) return proxy;
      break;
    }
    var parentDomain = host.substring(subDot + 1);
    if (whitelist[parentDomain]) return direct;
    if (domains[parentDomain]) return proxy;
    lastDot = subDot;
  }

  // 6. Default fallback
  return direct;
}`;

  return {
    pacScript: sanitizeToAscii(pacScript),
    proxyCount: Object.keys(proxyMap).length,
    whitelistCount: Object.keys(whiteMap).length,
  };
}

/**
 * Overloaded compileGfwlistToPac:
 * Can be called with (options: GfwlistPacOptions) -> returns { pacScript, proxyCount, whitelistCount }
 * Or can be called with (mirrorUrl: string, proxyStatement?: string) -> Promise<{ success, pacScript, domainCount, whitelistCount, sourceLabel, error }>
 */
export function compileGfwlistToPac(options: GfwlistPacOptions): {
  pacScript: string;
  proxyCount: number;
  whitelistCount: number;
};
export function compileGfwlistToPac(
  mirrorUrl: string,
  proxyStatement?: string
): Promise<{
  success: boolean;
  pacScript: string;
  domainCount: number;
  whitelistCount: number;
  sourceLabel: string;
  error?: string;
}>;
export function compileGfwlistToPac(
  firstArg: GfwlistPacOptions | string,
  secondArg?: string
): any {
  if (typeof firstArg === 'object' && firstArg !== null) {
    return compileGfwlistWithOptions(firstArg);
  }

  // Async version: fetch mirror and compile
  const mirrorUrl = firstArg;
  const proxyStatement = secondArg || 'SOCKS5 127.0.0.1:7897; DIRECT';

  return (async () => {
    try {
      const syncRes = await syncRuleList(mirrorUrl);
      const compiled = compileGfwlistWithOptions({
        proxyStatement,
        fallbackStatement: 'DIRECT',
        rulesText: syncRes.text,
        sourceUrl: syncRes.source,
      });

      return {
        success: true,
        pacScript: compiled.pacScript,
        domainCount: compiled.proxyCount,
        whitelistCount: compiled.whitelistCount,
        sourceLabel: syncRes.source,
      };
    } catch (err: any) {
      // Fallback to curated
      const fallbackCompiled = compileGfwlistWithOptions({
        proxyStatement,
        fallbackStatement: 'DIRECT',
        sourceUrl: 'Fallback Curated Base',
      });
      return {
        success: false,
        pacScript: fallbackCompiled.pacScript,
        domainCount: fallbackCompiled.proxyCount,
        whitelistCount: fallbackCompiled.whitelistCount,
        sourceLabel: '精选离线核心库',
        error: err.message || '网络连接超时',
      };
    }
  })();
}
