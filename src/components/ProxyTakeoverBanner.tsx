import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Download, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  RefreshCw,
  X,
  Smartphone,
  Globe
} from 'lucide-react';
import { Profile } from '../types/omega';

interface ProxyTakeoverBannerProps {
  activeProfile: Profile;
  profiles: Profile[];
  onOpenPackager: () => void;
  onOpenDocs: () => void;
  onSelectTab: (tab: 'profiles' | 'inspector' | 'simulator' | 'pac' | 'cloud' | 'backup') => void;
  onOpenTakeoverGuidance?: () => void;
}

export const ProxyTakeoverBanner: React.FC<ProxyTakeoverBannerProps> = ({
  activeProfile,
  profiles,
  onOpenPackager,
  onOpenDocs,
  onSelectTab,
  onOpenTakeoverGuidance,
}) => {
  const [isExtensionContext, setIsExtensionContext] = useState(false);
  const [controlLevel, setControlLevel] = useState<string>('unknown');
  const [isDismissed, setIsDismissed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Check if running inside real Chrome Extension
  useEffect(() => {
    try {
      const isExt = typeof window !== 'undefined' && 
        typeof (window as any).chrome !== 'undefined' && 
        Boolean((window as any).chrome?.proxy?.settings);
      setIsExtensionContext(isExt);

      if (isExt && (window as any).chrome?.proxy?.settings?.get) {
        checkExtensionProxyStatus();
      }
    } catch {
      setIsExtensionContext(false);
    }
  }, []);

  const checkExtensionProxyStatus = () => {
    setChecking(true);
    try {
      const chromeObj = (window as any).chrome;
      if (chromeObj?.proxy?.settings?.get) {
        chromeObj.proxy.settings.get({ incognito: false }, (details: any) => {
          setChecking(false);
          const loc = details?.levelOfControl || 'unknown';
          setControlLevel(loc);
          if (loc === 'controlled_by_other_extensions') {
            setConflictWarning('检测到其他代理插件（如 SwitchyOmega、Clash TUN 插件）正在占用浏览器代理控制权，请在 chrome://extensions 中临时关闭其他扩展。');
          } else {
            setConflictWarning(null);
          }
        });
      } else {
        setChecking(false);
      }
    } catch {
      setChecking(false);
    }
  };

  if (isDismissed) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>当前生效情景模式：<strong className="text-slate-700 dark:text-slate-200">{activeProfile.name}</strong></span>
          <span className="text-slate-400">|</span>
          <span>运行模式：{isExtensionContext ? 'Chrome 原生插件环境' : '网页配置中心 (未安装插件)'}</span>
        </div>
        <button 
          onClick={() => setIsDismissed(false)}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          展开接管状态说明 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 1. In real Chrome extension environment
  if (isExtensionContext) {
    return (
      <div className={`border-b px-3 sm:px-6 py-2 transition-colors ${
        conflictWarning 
          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {conflictWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {conflictWarning ? '⚠️ 代理控制权被冲突扩展占用' : '🟢 浏览器原生底层代理：已连接并成功接管'}
              </span>
              <span className="ml-2 text-[11px] opacity-90">
                当前生效情景：<strong className="underline">{activeProfile.name}</strong>
                {activeProfile.profileType === 'FixedProfile' ? ' (127.0.0.1:7897)' : ' (PAC 智能分流)'}
              </span>
              {conflictWarning && (
                <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-0.5">
                  {conflictWarning}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={checkExtensionProxyStatus}
              disabled={checking}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? '检测中' : '刷新控制权'}</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="收起提示"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. In Web Preview / Simulator mode
  return (
    <div className="bg-linear-to-r from-blue-50 via-indigo-50/70 to-blue-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border-b border-blue-200 dark:border-blue-900/60 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Left explanation */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white">
                💡 为什么点击模式在当前网页中不直接接管浏览器？
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300">
                运行在 Web 网页沙箱模式
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              现代浏览器出于安全防护，<strong>普通网页无法直接劫持操作系统/浏览器的系统代理</strong>。
              要让 ProxyPilot <strong>100% 真实接管浏览器全网流量</strong>，只需导出扩展包并在 Chrome/Edge/Kiwi 浏览器中以开发者模式加载即可！
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="w-full lg:w-auto flex flex-wrap items-center justify-between sm:justify-start gap-2 pt-1 lg:pt-0 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial">
            <button
              onClick={onOpenTakeoverGuidance || onOpenPackager}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-sm transition-all transform active:scale-95 text-center"
              title="一键查看真实接管浏览器教程"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>真实接管指南</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="查看手机/电脑端安装指南"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>手机/PC指南</span>
            </button>

            <button
              onClick={() => onSelectTab('simulator')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
              title="测试域名和分流规则"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>路由模拟</span>
            </button>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
            title="收起横幅"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
