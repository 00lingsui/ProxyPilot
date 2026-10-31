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
  X
} from 'lucide-react';
import { Profile } from '../types/omega';

interface SidebarProps {
  profiles: Profile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  activeProfileId: string;
  onSetActiveProfile: (id: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenBackupModal: () => void;
  onOpenDocsModal: () => void;
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
          <button
            onClick={onOpenNewProfileModal}
            className="min-h-[32px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
            title="新建情景模式"
          >
            <Plus className="w-3.5 h-3.5" />
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

          return (
            <div
              key={profile.id}
              onClick={() => {
                onSelectProfile(profile.id);
                if (onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`group min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                isSelected
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
                <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                  {getProfileTypeBadge(profile.profileType)}
                </span>
                {isActive && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" 
                    title="当前浏览器正使用此情景模式"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings & Tools Bottom Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shrink-0 pb-18 md:pb-3">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-2">
          配置与帮助
        </div>

        <button
          onClick={() => {
            onOpenBackupModal();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full min-h-[40px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <DownloadCloud className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>备份与还原 (Backup)</span>
        </button>

        <button
          onClick={() => {
            onOpenDocsModal();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full min-h-[40px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
