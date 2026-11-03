import { Profile, ConditionType } from '../types/omega';

export interface ProxyPilotConsoleApi {
  version: string;
  getProfiles: () => Profile[];
  getActiveProfile: () => string;
  setActiveProfile: (profileId: string) => boolean;
  addRule: (pattern: string, profileId?: string, conditionType?: ConditionType) => boolean;
  setPort: (port: number) => void;
  exportConfig: () => string;
  pingAll: () => Promise<void>;
  help: () => void;
}

declare global {
  interface Window {
    proxyPilot?: ProxyPilotConsoleApi;
  }
}

export function registerConsoleApi(
  profiles: Profile[],
  activeProfileId: string,
  callbacks: {
    setActiveProfileId: (id: string) => void;
    onAddRule?: (pattern: string, profileId: string, conditionType: ConditionType) => void;
    onSetPort?: (port: number) => void;
    onPingAll?: () => Promise<void>;
  }
) {
  if (typeof window === 'undefined') return;

  window.proxyPilot = {
    version: '1.0.6',
    getProfiles: () => profiles,
    getActiveProfile: () => activeProfileId,
    setActiveProfile: (id: string) => {
      const found = profiles.find(p => p.id === id || p.name === id);
      if (found) {
        callbacks.setActiveProfileId(found.id);
        console.log(`[ProxyPilot] 已切换至情景模式: "${found.name}" (${found.id})`);
        return true;
      }
      console.warn(`[ProxyPilot] 未找到情景模式: ${id}`);
      return false;
    },
    addRule: (pattern: string, profileId = 'proxy_clash', conditionType: ConditionType = 'HostWildcardCondition') => {
      if (callbacks.onAddRule) {
        callbacks.onAddRule(pattern, profileId, conditionType);
        console.log(`[ProxyPilot] 已新增分流规则: ${pattern} -> ${profileId}`);
        return true;
      }
      return false;
    },
    setPort: (port: number) => {
      if (callbacks.onSetPort) {
        callbacks.onSetPort(port);
        console.log(`[ProxyPilot] 已批量更新代理端口至: ${port}`);
      }
    },
    exportConfig: () => {
      const json = JSON.stringify({ profiles, activeProfileId, version: '1.0.6' }, null, 2);
      console.log(json);
      return json;
    },
    pingAll: async () => {
      if (callbacks.onPingAll) {
        await callbacks.onPingAll();
      }
    },
    help: () => {
      console.log(`
%c🚀 ProxyPilot Developer Console API v1.0.6%c
支持在控制台直接执行以下指令:
  • proxyPilot.getProfiles()                 - 列出所有情景模式
  • proxyPilot.setActiveProfile('direct')     - 切换当前生效情景模式
  • proxyPilot.addRule('*.example.com')      - 一键添加分流规则
  • proxyPilot.setPort(7897)                 - 批量更新所有节点端口
  • proxyPilot.pingAll()                     - 批量测速所有代理节点
  • proxyPilot.exportConfig()                - 导出完整 JSON 配置
      `, 'color: #2563eb; font-weight: bold; font-size: 14px;', 'color: inherit;');
    }
  };
}
