import React from 'react';
import { 
  Network, 
  Layers, 
  PlayCircle, 
  Code2, 
  Download, 
  Smartphone, 
  Check, 
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Activity,
  Cloud
} from 'lucide-react';
import { Profile } from '../types/omega';

interface HeaderProps {
  currentTab: 'profiles' | 'inspector' | 'simulator' | 'pac' | 'cloud' | 'backup';
  setCurrentTab: (tab: 'profiles' | 'inspector' | 'simulator' | 'pac' | 'cloud' | 'backup') => void;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  profiles: Profile[];
  togglePopup: () => void;
  isPopupOpen: boolean;
  onOpenPackager: () => void;
  hasUnsavedChanges: boolean;
  onApplyChanges: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeProfileId,
  setActiveProfileId,
  profiles,
  togglePopup,
  isPopupOpen,
  onOpenPackager,
  hasUnsavedChanges,
  onApplyChanges,
  theme,
  onToggleTheme,
  onToggleMobileDrawer,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shrink-0 select-none z-30 transition-colors">
        {/* Zone 1: Mobile drawer trigger + Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileDrawer && (
            <button
              onClick={onToggleMobileDrawer}
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="打开情景模式菜单"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Network className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                ProxyPilot
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold hidden xs:inline">
                7897
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Smart Proxy Automation Suite
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Links (hidden on mobile, uses bottom bar) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('profiles')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'profiles'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>情景配置</span>
          </button>

          <button
            onClick={() => setCurrentTab('inspector')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'inspector'
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-xs font-semibold border border-blue-200 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>请求日志诊断</span>
          </button>

          <button
            onClick={() => setCurrentTab('simulator')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'simulator'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>路由模拟</span>
          </button>

          <button
            onClick={() => setCurrentTab('pac')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'pac'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PAC 脚本</span>
          </button>

          <button
            onClick={() => setCurrentTab('cloud')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'cloud'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>云同步/Clash</span>
          </button>

          <button
            onClick={() => setCurrentTab('backup')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'backup'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>备份与预设</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Quick Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Apply changes notification */}
          {hasUnsavedChanges && (
            <button
              onClick={onApplyChanges}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-300 dark:border-amber-700 rounded-md transition-colors animate-pulse"
              title="有未应用的更改，点击立即生效"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="hidden sm:inline">应用更改</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'dark' ? '切换至浅色模式' : '切换至深色模式'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Active Profile Dropdown & Mobile Action Sheet */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="min-h-[38px] sm:min-h-[40px] flex items-center gap-1.5 sm:gap-2 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 transition-colors"
              aria-label="选择当前生效代理情景"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                style={{ backgroundColor: activeProfile.color || '#3b82f6' }}
              />
              <span className="font-semibold max-w-[70px] xs:max-w-[100px] sm:max-w-[120px] truncate">{activeProfile.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {profileDropdownOpen && (
              <>
                {/* Desktop dropdown */}
                <div 
                  className="hidden md:block absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 text-xs"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    切换当前生效情景
                  </div>
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProfileId(p.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                        p.id === activeProfileId ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: p.color || '#3b82f6' }}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      {p.id === activeProfileId && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Mobile Bottom Sheet Action Modal */}
                <div 
                  className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div 
                    className="bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 p-4 max-h-[75vh] flex flex-col space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">切换生效情景模式</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">点击直接切换全局或自动分流规则</div>
                      </div>
                      <button 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="text-base font-bold leading-none">✕</span>
                      </button>
                    </div>

                    <div className="overflow-y-auto space-y-2 py-1 max-h-[50vh]">
                      {profiles.map(p => {
                        const isCurrent = p.id === activeProfileId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveProfileId(p.id);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full min-h-[50px] flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                              isCurrent 
                                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-100 font-bold shadow-xs' 
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                                style={{ backgroundColor: p.color || '#3b82f6' }}
                              />
                              <div className="truncate">
                                <div className="text-xs font-semibold truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                  {p.profileType === 'FixedProfile' ? '固定端口 7897' : p.profileType === 'SwitchProfile' ? '智能自动分流' : p.profileType}
                                </div>
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                                生效中
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Popup Simulator Trigger */}
          <button
            onClick={togglePopup}
            className={`min-w-[36px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isPopupOpen 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="打开扩展插件弹窗 (支持 Kiwi / Chrome)"
          >
            <Smartphone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline">扩展弹出窗</span>
          </button>

          {/* 1-Click Browser Extension Package Download */}
          <button
            onClick={onOpenPackager}
            className="min-h-[36px] sm:min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">导出插件 (.zip)</span>
            <span className="sm:hidden">导出</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-5 items-center h-16 pb-safe transition-colors select-none shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setCurrentTab('profiles')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTab === 'profiles' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {currentTab === 'profiles' && (
            <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <Layers className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">情景配置</span>
        </button>

        <button
          onClick={() => setCurrentTab('inspector')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTab === 'inspector' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {currentTab === 'inspector' && (
            <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] tracking-tight">抓包诊断</span>
        </button>

        <button
          onClick={() => setCurrentTab('simulator')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTab === 'simulator' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {currentTab === 'simulator' && (
            <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <PlayCircle className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">路由模拟</span>
        </button>

        <button
          onClick={() => setCurrentTab('cloud')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTab === 'cloud' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {currentTab === 'cloud' && (
            <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <Cloud className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">云同步</span>
        </button>

        <button
          onClick={() => setCurrentTab('backup')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTab === 'backup' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {currentTab === 'backup' && (
            <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">预设/导出</span>
        </button>
      </nav>
    </>
  );
};
