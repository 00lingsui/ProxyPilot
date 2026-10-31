import { Profile, DirectProfile, SystemProfile, FixedProfile, SwitchProfile, PacProfile } from '../types/omega';

export const DIRECT_PROFILE: DirectProfile = {
  id: 'direct',
  name: '直接连接 (Direct)',
  profileType: 'DirectProfile',
  color: '#64748b',
};

export const SYSTEM_PROFILE: SystemProfile = {
  id: 'system',
  name: '系统代理 (System)',
  profileType: 'SystemProfile',
  color: '#0284c7',
};

export const DEFAULT_PROFILES: Profile[] = [
  DIRECT_PROFILE,
  SYSTEM_PROFILE,
  {
    id: 'proxy_clash',
    name: 'Proxy (SOCKS5 7897)',
    profileType: 'FixedProfile',
    color: '#10b981',
    useSingleProxy: true,
    fallbackProxy: {
      scheme: 'socks5',
      host: '127.0.0.1',
      port: 7897,
    },
    bypassList: [
      { id: 'b1', pattern: '127.0.0.1', enabled: true },
      { id: 'b2', pattern: '[::1]', enabled: true },
      { id: 'b3', pattern: 'localhost', enabled: true },
      { id: 'b4', pattern: '192.168.*', enabled: true },
      { id: 'b5', pattern: '10.*', enabled: true },
      { id: 'b6', pattern: '<local>', enabled: true },
    ],
  } as FixedProfile,
  {
    id: 'proxy_http',
    name: 'HTTP 代理 (7897)',
    profileType: 'FixedProfile',
    color: '#8b5cf6',
    useSingleProxy: true,
    fallbackProxy: {
      scheme: 'http',
      host: '127.0.0.1',
      port: 7897,
    },
    bypassList: [
      { id: 'b1', pattern: '127.0.0.1', enabled: true },
      { id: 'b2', pattern: 'localhost', enabled: true },
      { id: 'b3', pattern: '<local>', enabled: true },
    ],
  } as FixedProfile,
  {
    id: 'auto_switch',
    name: '自动切换 (Auto Switch)',
    profileType: 'SwitchProfile',
    color: '#f59e0b',
    defaultProfileId: 'direct',
    rules: [
      {
        id: 'r1',
        conditionType: 'HostWildcardCondition',
        pattern: '*.google.com',
        profileId: 'proxy_clash',
        enabled: true,
        note: 'Google 国际服务',
      },
      {
        id: 'r2',
        conditionType: 'HostWildcardCondition',
        pattern: '*.github.com',
        profileId: 'proxy_clash',
        enabled: true,
        note: 'GitHub 开发加速',
      },
      {
        id: 'r3',
        conditionType: 'HostWildcardCondition',
        pattern: '*.youtube.com',
        profileId: 'proxy_clash',
        enabled: true,
        note: 'YouTube 媒体',
      },
      {
        id: 'r4',
        conditionType: 'HostWildcardCondition',
        pattern: '*.wikipedia.org',
        profileId: 'proxy_clash',
        enabled: true,
        note: '维基百科',
      },
      {
        id: 'r5',
        conditionType: 'HostWildcardCondition',
        pattern: '*.internal.corp',
        profileId: 'direct',
        enabled: true,
        note: '公司内部服务直连',
      },
      {
        id: 'r6',
        conditionType: 'UrlRegexCondition',
        pattern: '^https?://192\\.168\\.\\d+\\.\\d+',
        profileId: 'direct',
        enabled: true,
        note: '局域网网段直接访问',
      },
    ],
    ruleListConfig: {
      enabled: true,
      url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
      format: 'AutoProxy',
      profileId: 'proxy_clash',
      defaultProfileId: 'direct',
      rulesText: `! Sample AutoProxy / GFWList segment
||twitter.com
||x.com
||facebook.com
||instagram.com
||reddit.com
||medium.com
||notion.so
||openai.com
@@||baidu.com
@@||taobao.com
@@||bilibili.com`,
      lastUpdated: '2026-10-31 08:00:00',
    },
  } as SwitchProfile,
  {
    id: 'pac_custom',
    name: 'PAC 智能脚本 (PAC Script)',
    profileType: 'PacProfile',
    color: '#ec4899',
    pacUrl: 'http://127.0.0.1:7897/proxy.pac',
    pacScript: `function FindProxyForURL(url, host) {
  // Local direct connection
  if (isPlainHostName(host) ||
      shExpMatch(host, "*.local") ||
      isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
      isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")) {
    return "DIRECT";
  }

  // Development domains
  if (shExpMatch(host, "*.dev.internal")) {
    return "PROXY 127.0.0.1:7897; DIRECT";
  }

  // Smart proxy routing
  if (shExpMatch(host, "*.google.com") || shExpMatch(host, "*.github.com")) {
    return "SOCKS5 127.0.0.1:7897; SOCKS 127.0.0.1:7897; DIRECT";
  }

  return "DIRECT";
}`,
  } as PacProfile,
];

export const PRESET_TEMPLATES = [
  {
    id: 'clash',
    title: 'Clash / Mihomo / Sing-box 7897 配置',
    description: 'SOCKS5/HTTP 混合端口: 127.0.0.1:7897, 自动分流规则',
    targetProfile: 'proxy_clash',
  },
  {
    id: 'v2ray',
    title: 'V2Ray / Xray / 局域网代理',
    description: 'SOCKS5/HTTP: 127.0.0.1:7897, 支持局域网与移动设备共享',
    targetProfile: 'proxy_http',
  },
  {
    id: 'developer',
    title: '全栈移动与桌面开发工作流',
    description: 'localhost、192.168.*、Kiwi移动端、局域网调试直连，外部资源走 7897 分流',
    targetProfile: 'auto_switch',
  },
];
