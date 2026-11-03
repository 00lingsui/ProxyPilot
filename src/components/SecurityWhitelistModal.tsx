import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Building2, 
  GraduationCap, 
  Landmark, 
  Network,
  Check
} from 'lucide-react';
import { SecurityBypassConfig } from '../types/omega';
import { 
  DEFAULT_SECURITY_BYPASS,
  PRESET_GOV_DOMAINS,
  PRESET_EDU_DOMAINS,
  PRESET_BANKING_DOMAINS,
  PRESET_LOCAL_LAN
} from '../utils/securityWhitelist';

interface SecurityWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SecurityBypassConfig;
  onSaveConfig: (updated: SecurityBypassConfig) => void;
}

export const SecurityWhitelistModal: React.FC<SecurityWhitelistModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [currentConfig, setCurrentConfig] = useState<SecurityBypassConfig>(config || DEFAULT_SECURITY_BYPASS);
  const [newDomain, setNewDomain] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    if (currentConfig.customDomains.includes(trimmed)) return;

    setCurrentConfig({
      ...currentConfig,
      customDomains: [...currentConfig.customDomains, trimmed],
    });
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setCurrentConfig({
      ...currentConfig,
      customDomains: currentConfig.customDomains.filter(d => d !== domain),
    });
  };

  const handleSave = () => {
    onSaveConfig(currentConfig);
    setToastMsg('隐私安全白名单设置已生效！');
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>隐私安全与绝对直连白名单</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Never Proxy
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                强制最高优先级直接连接，杜绝银行、网银、政务与内网敏感流量流向代理服务器
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {toastMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Master Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                启用绝对直连安全保护
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                开启后，所有白名单内的域名在 PAC 脚本和路由逻辑最顶层强制 return DIRECT
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.enabled}
                onChange={(e) => setCurrentConfig({ ...currentConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Pre-configured categories */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              内置预设白名单分类
            </div>

            {/* Gov */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    中国政务机构域名 (*.gov.cn)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    税务、人社、工商、政务公开等政府公共服务网站
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentConfig.bypassGovCn}
                onChange={(e) => setCurrentConfig({ ...currentConfig, bypassGovCn: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Edu */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    高校与科研教育网 (*.edu.cn)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    各大高校教务系统、校园网内网登录、知网校园认证
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentConfig.bypassEduCn}
                onChange={(e) => setCurrentConfig({ ...currentConfig, bypassEduCn: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Banking */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    国内主流银行与金融支付
                  </div>
                  <div className="text-[10px] text-slate-400">
                    工农中建交、招商、银联、支付宝支付网关 (绝不外泄)
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentConfig.bypassBanking}
                onChange={(e) => setCurrentConfig({ ...currentConfig, bypassBanking: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Local LAN */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Network className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    局域网与本地私有 IP 段
                  </div>
                  <div className="text-[10px] text-slate-400">
                    127.0.0.1, localhost, 192.168.*, 10.*, 172.16.*, &lt;local&gt;
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentConfig.bypassLocalLan}
                onChange={(e) => setCurrentConfig({ ...currentConfig, bypassLocalLan: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Never-Proxy Domains */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              自定义绝对直连域名
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                placeholder="例如 *.internal.corp 或 mycompany.com"
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
              <button
                onClick={handleAddDomain}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentConfig.customDomains.map(dom => (
                <span
                  key={dom}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono"
                >
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>{dom}</span>
                  <button
                    onClick={() => handleRemoveDomain(dom)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            最高保护级别：匹配项将直接直连，不经过任何代理
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              保存白名单设置
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
