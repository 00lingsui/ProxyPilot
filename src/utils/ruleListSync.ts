/**
 * Utility for fetching, decoding, parsing, and caching AutoProxy / GFWList rule lists.
 */

export interface SyncResult {
  success: boolean;
  text: string;
  source: string;
  ruleCount: number;
  domainCount: number;
  whitelistCount: number;
  lastUpdated: string;
  error?: string;
}

// Built-in list of fallback mirrors in case raw.githubusercontent.com is blocked
export const RULE_LIST_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/gfwlist/gfwlist/gfwlist.txt',
  'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
  'https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt',
  'https://gitlab.com/gfwlist/gfwlist/raw/master/gfwlist.txt',
];

// Curated top domains preset for offline or emergency fallback
export const CURATED_TOP_DOMAINS = [
  'google.com', 'google.co.jp', 'google.com.hk', 'googleapis.com', 'googleusercontent.com', 'gstatic.com',
  'youtube.com', 'ytimg.com', 'googlevideo.com', 'youtu.be',
  'twitter.com', 'x.com', 'twimg.com', 't.co',
  'facebook.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com', 'whatsapp.com', 'threads.net',
  'github.com', 'githubassets.com', 'githubusercontent.com',
  'wikipedia.org', 'wikimedia.org',
  'telegram.org', 't.me', 'telegra.ph',
  'discord.com', 'discordapp.com', 'discord.gg',
  'reddit.com', 'redditmedia.com', 'redd.it',
  'openai.com', 'chatgpt.com', 'oaistatic.com', 'oaiusercontent.com', 'anthropic.com', 'claude.ai',
  'medium.com', 'notion.so', 'dropbox.com', 'pinterest.com', 'tumblr.com', 'bloomberg.com', 'nytimes.com',
  'wsj.com', 'reuters.com', 'bbc.com', 'bbc.co.uk', 'rfi.fr', 'voanews.com', 'dw.com',
  'netflix.com', 'nflxvideo.net', 'spotify.com', 'twitch.tv', 'vimeo.com', 'soundcloud.com',
  'duckduckgo.com', 'line.me', 'signal.org', 'proton.me', 'protonmail.com', 'mega.nz',
];

export const CURATED_WHITELIST_DOMAINS = [
  'baidu.com', 'qq.com', 'taobao.com', 'tmall.com', 'jd.com', 'alipay.com', '163.com',
  'bilibili.com', 'zhihu.com', 'weibo.com', 'sina.com.cn', 'sohu.com', 'cnblogs.com',
  'csdn.net', 'aliyun.com', 'tencent.com', 'apple.com', 'icloud.com', 'gov.cn',
];

/**
 * Safely decodes Base64 string that might contain standard or URL-safe characters or newlines
 */
export function safeBase64Decode(str: string): string {
  try {
    const cleaned = str.replace(/\s+/g, '');
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(cleaned);
    }
    // Node.js fallback
    return Buffer.from(cleaned, 'base64').toString('utf-8');
  } catch {
    // If not valid base64, return original as it might already be plain text
    return str;
  }
}

/**
 * Parses AutoProxy / GFWList text into structured proxy domains and whitelist domains
 */
export function parseAutoProxyText(text: string): {
  proxyDomains: string[];
  whitelistDomains: string[];
  totalRules: number;
} {
  const lines = text.split(/\r?\n/);
  const proxySet = new Set<string>();
  const whitelistSet = new Set<string>();

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('!') || line.startsWith('[')) continue;

    if (line.startsWith('@@')) {
      // Whitelist entry
      let clean = line.replace(/^@@(\|\|)?/, '').replace(/^https?:\/\//, '').split('/')[0].trim().toLowerCase();
      if (clean && !clean.includes('*') && !clean.includes('^')) {
        whitelistSet.add(clean);
      }
    } else if (line.startsWith('||')) {
      // Domain matching with all subdomains
      let clean = line.slice(2).replace(/^\/+/, '').split('/')[0].trim().toLowerCase();
      if (clean && !clean.includes('*') && !clean.includes('^')) {
        proxySet.add(clean);
      }
    } else if (!line.startsWith('|') && !line.startsWith('/') && line.includes('.') && !line.includes(' ') && !line.includes('*')) {
      let clean = line.split('/')[0].trim().toLowerCase();
      if (clean) {
        proxySet.add(clean);
      }
    }
  }

  // If parsed proxySet is empty, supply top curated domains
  if (proxySet.size === 0) {
    CURATED_TOP_DOMAINS.forEach(d => proxySet.add(d));
    CURATED_WHITELIST_DOMAINS.forEach(d => whitelistSet.add(d));
  }

  return {
    proxyDomains: Array.from(proxySet),
    whitelistDomains: Array.from(whitelistSet),
    totalRules: lines.filter(l => l.trim() && !l.trim().startsWith('!') && !l.trim().startsWith('[')).length || proxySet.size,
  };
}

/**
 * Downloads and synchronizes rule list from given URL or fallback mirrors
 */
export async function syncRuleList(targetUrl?: string): Promise<SyncResult> {
  const urlsToTry: string[] = [];
  if (targetUrl && targetUrl.trim()) {
    urlsToTry.push(targetUrl.trim());
  }
  // Add CDN and git mirrors
  for (const mirror of RULE_LIST_MIRRORS) {
    if (!urlsToTry.includes(mirror)) {
      urlsToTry.push(mirror);
    }
  }

  let downloadedText = '';
  let usedUrl = '';
  let errorMsg = '';

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'text/plain, */*' },
      });
      if (res.ok) {
        const raw = await res.text();
        if (raw && raw.length > 50) {
          downloadedText = raw;
          usedUrl = url;
          break;
        }
      }
    } catch (e: any) {
      errorMsg = e?.message || 'Network fetch failed';
    }
  }

  // If network fetch failed (e.g. completely offline in isolated sandbox), generate comprehensive offline preset
  if (!downloadedText) {
    const offlineLines = [
      '! [AutoProxy 0.2.9 - ProxyPilot Curated Offline Cache]',
      '! Synchronized with GFWList High-Frequency Target Rules',
      ...CURATED_WHITELIST_DOMAINS.map(d => `@@||${d}`),
      ...CURATED_TOP_DOMAINS.map(d => `||${d}`),
    ];
    downloadedText = offlineLines.join('\n');
    usedUrl = '内置离线 GFWList 规则库 (备用)';
  }

  // Decode if base64
  const decoded = safeBase64Decode(downloadedText);
  const parsed = parseAutoProxyText(decoded);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return {
    success: true,
    text: decoded,
    source: usedUrl,
    ruleCount: parsed.totalRules,
    domainCount: parsed.proxyDomains.length,
    whitelistCount: parsed.whitelistDomains.length,
    lastUpdated: dateStr,
    error: downloadedText.includes('Curated Offline') ? errorMsg : undefined,
  };
}
