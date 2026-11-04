// ProxyPilot High-Performance GFWList PAC Script
// Generated at: 2026-11-04T09:08:47.839Z
// Source: ProxyPilot Curated Base (4,430+ domains)
// Rules: 101 proxy domains, 27 whitelist domains
// Target Proxy: SOCKS5 127.0.0.1:7897; SOCKS 127.0.0.1:7897; DIRECT

var proxy = "SOCKS5 127.0.0.1:7897; SOCKS 127.0.0.1:7897; DIRECT";
var direct = "DIRECT";

// Fast Whitelist Hash Map (Direct Connection)
var whitelist = {
  "baidu.com": 1,
  "qq.com": 1,
  "taobao.com": 1,
  "tmall.com": 1,
  "jd.com": 1,
  "alipay.com": 1,
  "163.com": 1,
  "126.net": 1,
  "bilibili.com": 1,
  "zhihu.com": 1,
  "weibo.com": 1,
  "sina.com.cn": 1,
  "sohu.com": 1,
  "cnblogs.com": 1,
  "csdn.net": 1,
  "aliyun.com": 1,
  "tencent.com": 1,
  "apple.com": 1,
  "icloud.com": 1,
  "gov.cn": 1,
  "edu.cn": 1,
  "gitee.com": 1,
  "douyin.com": 1,
  "kuaishou.com": 1,
  "xiaohongshu.com": 1,
  "meituan.com": 1,
  "ele.me": 1
};

// Fast GFWList Proxy Hash Map (O(1) Lookup)
var domains = {
  "google.com": 1,
  "google.co.jp": 1,
  "google.com.hk": 1,
  "google.co.uk": 1,
  "googleapis.com": 1,
  "googleusercontent.com": 1,
  "gstatic.com": 1,
  "googlevideo.com": 1,
  "youtube.com": 1,
  "ytimg.com": 1,
  "youtu.be": 1,
  "gmail.com": 1,
  "googlecode.com": 1,
  "googleblog.com": 1,
  "openai.com": 1,
  "chatgpt.com": 1,
  "oaistatic.com": 1,
  "oaiusercontent.com": 1,
  "anthropic.com": 1,
  "claude.ai": 1,
  "huggingface.co": 1,
  "cohere.com": 1,
  "midjourney.com": 1,
  "perplexity.ai": 1,
  "groq.com": 1,
  "mistral.ai": 1,
  "gemini.google.com": 1,
  "twitter.com": 1,
  "x.com": 1,
  "twimg.com": 1,
  "t.co": 1,
  "telegram.org": 1,
  "t.me": 1,
  "telegra.ph": 1,
  "facebook.com": 1,
  "fbcdn.net": 1,
  "instagram.com": 1,
  "cdninstagram.com": 1,
  "whatsapp.com": 1,
  "threads.net": 1,
  "discord.com": 1,
  "discordapp.com": 1,
  "discord.gg": 1,
  "reddit.com": 1,
  "redditmedia.com": 1,
  "redd.it": 1,
  "line.me": 1,
  "signal.org": 1,
  "tumblr.com": 1,
  "pinterest.com": 1,
  "github.com": 1,
  "githubassets.com": 1,
  "githubusercontent.com": 1,
  "gitlab.com": 1,
  "docker.com": 1,
  "docker.io": 1,
  "npmjs.org": 1,
  "npmjs.com": 1,
  "deno.land": 1,
  "rust-lang.org": 1,
  "golang.org": 1,
  "python.org": 1,
  "pypi.org": 1,
  "cloudflare.com": 1,
  "cloudflare-dns.com": 1,
  "vercel.com": 1,
  "vercel.app": 1,
  "supabase.com": 1,
  "firebase.google.com": 1,
  "wikipedia.org": 1,
  "wikimedia.org": 1,
  "wikinews.org": 1,
  "wiktionary.org": 1,
  "medium.com": 1,
  "notion.so": 1,
  "dropbox.com": 1,
  "box.com": 1,
  "mega.nz": 1,
  "archive.org": 1,
  "bloomberg.com": 1,
  "nytimes.com": 1,
  "wsj.com": 1,
  "reuters.com": 1,
  "bbc.com": 1,
  "bbc.co.uk": 1,
  "rfi.fr": 1,
  "voanews.com": 1,
  "dw.com": 1,
  "netflix.com": 1,
  "nflxvideo.net": 1,
  "spotify.com": 1,
  "spotifycdn.com": 1,
  "twitch.tv": 1,
  "vimeo.com": 1,
  "soundcloud.com": 1,
  "duckduckgo.com": 1,
  "proton.me": 1,
  "protonmail.com": 1,
  "torproject.org": 1,
  "startpage.com": 1,
  "brave.com": 1
};

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
}