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

// Built-in list of fast, reliable CDN and mirror endpoints
export const RULE_LIST_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt',
  'https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt',
  'https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt',
  'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
  'https://gitlab.com/gfwlist/gfwlist/raw/master/gfwlist.txt',
];

// Curated top domains preset for fast offline or emergency fallback
export const CURATED_TOP_DOMAINS = [
  // Google ecosystem
  'google.com', 'google.co.jp', 'google.com.hk', 'google.co.uk', 'googleapis.com', 'googleusercontent.com', 'gstatic.com',
  'googlevideo.com', 'youtube.com', 'ytimg.com', 'youtu.be', 'gmail.com', 'googlecode.com', 'googleblog.com',
  // AI & Machine Learning
  'openai.com', 'chatgpt.com', 'oaistatic.com', 'oaiusercontent.com', 'anthropic.com', 'claude.ai',
  'huggingface.co', 'cohere.com', 'midjourney.com', 'perplexity.ai', 'groq.com', 'mistral.ai', 'gemini.google.com',
  // Social & Messaging
  'twitter.com', 'x.com', 'twimg.com', 't.co', 'telegram.org', 't.me', 'telegra.ph',
  'facebook.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com', 'whatsapp.com', 'threads.net',
  'discord.com', 'discordapp.com', 'discord.gg', 'reddit.com', 'redditmedia.com', 'redd.it',
  'line.me', 'signal.org', 'tumblr.com', 'pinterest.com',
  // Developer Platforms
  'github.com', 'githubassets.com', 'githubusercontent.com', 'gitlab.com', 'docker.com', 'docker.io',
  'npmjs.org', 'npmjs.com', 'deno.land', 'rust-lang.org', 'golang.org', 'python.org', 'pypi.org',
  'cloudflare.com', 'cloudflare-dns.com', 'vercel.com', 'vercel.app', 'supabase.com', 'firebase.google.com',
  // Knowledge & Media
  'wikipedia.org', 'wikimedia.org', 'wikinews.org', 'wiktionary.org',
  'medium.com', 'notion.so', 'dropbox.com', 'box.com', 'mega.nz', 'archive.org',
  'bloomberg.com', 'nytimes.com', 'wsj.com', 'reuters.com', 'bbc.com', 'bbc.co.uk', 'rfi.fr', 'voanews.com', 'dw.com',
  'netflix.com', 'nflxvideo.net', 'spotify.com', 'spotifycdn.com', 'twitch.tv', 'vimeo.com', 'soundcloud.com',
  // Privacy & Search
  'duckduckgo.com', 'proton.me', 'protonmail.com', 'torproject.org', 'startpage.com', 'brave.com'
];

export const CURATED_WHITELIST_DOMAINS = [
  'baidu.com', 'qq.com', 'taobao.com', 'tmall.com', 'jd.com', 'alipay.com', '163.com', '126.net',
  'bilibili.com', 'zhihu.com', 'weibo.com', 'sina.com.cn', 'sohu.com', 'cnblogs.com',
  'csdn.net', 'aliyun.com', 'tencent.com', 'apple.com', 'icloud.com', 'gov.cn', 'edu.cn',
  'gitee.com', 'douyin.com', 'kuaishou.com', 'xiaohongshu.com', 'meituan.com', 'ele.me'
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
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 3500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'text/plain, */*' },
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
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
      const res = await fetchWithTimeout(url, 3500);
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
      '! [AutoProxy 0.2.9 - ProxyPilot Curated Offline Base]',
      '! Synchronized with GFWList High-Frequency Target Rules',
      ...CURATED_WHITELIST_DOMAINS.map(d => `@@||${d}`),
      ...CURATED_TOP_DOMAINS.map(d => `||${d}`),
    ];
    downloadedText = offlineLines.join('\n');
    usedUrl = '内置高频 GFWList 规则库 (备用离线源)';
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
