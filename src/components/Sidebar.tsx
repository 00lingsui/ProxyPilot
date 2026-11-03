import React from 'react';
import { 
  Plus, 
  DownloadCloud, 
  BookOpen, 
  Circle,
  Radio,
  FileCode,
  Shuffle,
  Cpu,
  X,
  Zap,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { Profile, ProxyHealthStatus } from '../types/omega';

interface SidebarProps {
  profiles: Profile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  activeProfileId: string;
  onSetActiveProfile: (id: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenBackupModal: () => void;
  onOpenDocsModal: () => void;
  onOpenWorkspaces?: () => void;
  onOpenSecurityWhitelist?: () => void;
  onPingAll?: () => void;
  healthStatus?: Record<string, ProxyHealthStatus>;
  isTestingPing?: boolean;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  activeProfileId,
  onSetActiveProfile,
  onOpenNewProfileModal,
  onOpenBackupModal,
  onOpenDocsModal,
  onOpenWorkspaces,
  onOpenSecurityWhitelist,
  onPingAll,
  healthStatus,
  isTestingPing = false,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
}) => {
  const getProfileIcon = (type: Profile['profileType']) => {
    switch (type) {
      case 'FixedProfile':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'SwitchProfile':
        return <Shuffle className="w-3.5 h-3.5" />;
      case 'PacProfile':
        return <FileCode className="w-3.5 h-3.5" />;
      case 'DirectProfile':
      case 'SystemProfile':
        return <Radio className="w-3.5 h-3.5" />;
      default:
        return <Circle className="w-3.5 h-3.5" />;
    }
  };

  const getProfileTypeBadge = (type: Profile['profileType']) => {
    switch (type) {
      case 'FixedProfile':
        return '代理';
      case 'SwitchProfile':
        return '自动切换';
      case 'PacProfile':
        return 'PAC';
      case 'DirectProfile':
        return '直连';
      case 'SystemProfile':
        return '系统';
      case 'VirtualProfile':
        return '虚模式';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 select-none">
      {/* Profiles Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          情景模式 (PROFILES)
        </span>
        <div className="flex items-center gap-1">
          {onPingAll && (
            <button
              onClick={onPingAll}
              disabled={isTestingPing}
              className="min-h-[28px] flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors disabled:opacity-50"
              title="测速所有代理节点延迟"
            >
              <Zap className={`w-3 h-3 ${isTestingPing ? 'animate-bounce' : ''}`} />
              <span>{isTestingPing ? '测速中' : '测速'}</span>
            </button>
          )}
          <button
            onClick={onOpenNewProfileModal}
            className="min-h-[28px] flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
            title="新建情景模式"
          >
            <Plus className="w-3 h-3" />
            <span>新建</span>
          </button>
          {onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="md:hidden min-h-[32px] p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Profiles List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {profiles.map(profile => {
          const isSelected = profile.id === selectedProfileId;
          const isActive = profile.id === activeProfileId;
          const health = healthStatus?.[profile.id];

          return (
            <div
              key={profile.id}
              onClick={() => {
                onSelectProfile(profile.id);
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`group min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                isActive
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/60 text-slate-900 dark:text-white font-medium'
                  : isSelected
                  ? 'bg-white dark:bg-slate-800 border-blue-500 text-slate-900 dark:text-white shadow-xs font-medium'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: profile.color || '#64748b' }}
                />
                <span className="truncate">{profile.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {profile.profileType === 'FixedProfile' && health && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    health.status === 'online' 
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold' 
                      : health.status === 'warning'
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-semibold'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 font-semibold'
                  }`}>
                    {health.status === 'online' ? `● ${health.latencyMs}ms` : health.status === 'warning' ? `▲ ${health.latencyMs}ms` : '✕ 离线'}
                  </span>
                )}

                {isActive ? (
                  <span 
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500 text-white shadow-2xs"
                    title="当前浏览器全网流量正由此模式接管"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>生效中</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:hidden">
                      {getProfileTypeBadge(profile.profileType)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetActiveProfile(profile.id);
                      }}
                      className="hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-transform active:scale-95"
                      title="立即切换并设为此代理接管浏览器"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>接管</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* Settings & Tools Bottom Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shrink-0 pb-18 md:pb-3">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-2">
          预设与安全防护
        </div>

        {onOpenWorkspaces && (
          <button
            onClick={() => {
              onOpenWorkspaces();
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }}
            className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4 text-blue-500" />
            <span className="font-medium">工作空间与场景 (Scenes)</span>
          </button>
        )}

        {onOpenSecurityWhitelist && (
          <button
            onClick={() => {
              onOpenSecurityWhitelist();
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }}
            className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">绝对直连白名单 (Never Proxy)</span>
          </button>
        )}

        <button
          onClick={() => {
            onOpenBackupModal();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <DownloadCloud className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>备份与还原 (Backup)</span>
        </button>

        <button
          onClick={() => {
            onOpenDocsModal();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>手机与桌面端安装指南</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 h-full transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
          <div className="w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobileDrawer} />
        </div>
      )}
    </>
  );
};
