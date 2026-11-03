import { Profile, FixedProfile, WorkspacePreset } from '../types/omega';

export const DEFAULT_WORKSPACES: WorkspacePreset[] = [
  {
    id: 'clash_verge',
    name: '现代 Clash / Mihomo / Clash Verge',
    description: '现代混合端口 7897 (支持 SOCKS5 / HTTP 自动识别)',
    icon: 'Zap',
    defaultPort: 7897,
  },
  {
    id: 'clash_classic',
    name: '经典 Clash / CFW (7890)',
    description: '原版 Clash for Windows 经典混合端口 7890',
    icon: 'Globe',
    defaultPort: 7890,
  },
  {
    id: 'v2rayn',
    name: 'v2rayN / Xray 客户端 (10808)',
    description: 'Windows v2rayN 默认本地 SOCKS5 端口 10808',
    icon: 'Cpu',
    defaultPort: 10808,
  },
  {
    id: 'singbox',
    name: 'Sing-box 通用混合端口 (2080)',
    description: '新一代 Sing-box 客户端常用本地 Inbound 端口 2080',
    icon: 'Radio',
    defaultPort: 2080,
  },
  {
    id: 'office_mode',
    name: '公司 / 办公场景模式 (Office)',
    description: '自动保持 7897 端口，强制保障内网直连与公司内网安全',
    icon: 'Building',
    defaultPort: 7897,
  },
  {
    id: 'home_mode',
    name: '家庭 / 极速模式 (Home)',
    description: '针对家庭千兆网络调优，自动开启智能故障自动学习',
    icon: 'Home',
    defaultPort: 7897,
  },
  {
    id: 'travel_mode',
    name: '出差 / 漫游场景 (Travel)',
    description: '公共 Wi-Fi 环境下保护敏感流量，启用严格安全白名单',
    icon: 'Plane',
    defaultPort: 7897,
  }
];

/**
 * Batch updates all FixedProfiles to a new port
 */
export function applyWorkspacePort(profiles: Profile[], port: number): Profile[] {
  return profiles.map(p => {
    if (p.profileType === 'FixedProfile') {
      const fixed = p as FixedProfile;
      return {
        ...fixed,
        fallbackProxy: {
          ...fixed.fallbackProxy,
          port,
        },
      };
    }
    return p;
  });
}
