/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Radio, 
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Profile } from './types/omega';
import { DEFAULT_PROFILES } from './utils/defaultData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProxyTakeoverBanner } from './components/ProxyTakeoverBanner';
import { ProfileProxyEditor } from './components/ProfileProxyEditor';
import { ProfileAutoSwitchEditor } from './components/ProfileAutoSwitchEditor';
import { ProfilePacEditor } from './components/ProfilePacEditor';
import { ProfileVirtualEditor } from './components/ProfileVirtualEditor';
import { QuickSwitcherPopup } from './components/QuickSwitcherPopup';
import { RouteSimulator } from './components/RouteSimulator';
import { PacCodeViewer } from './components/PacCodeViewer';
import { RequestInspector } from './components/RequestInspector';
import { CloudSyncView } from './components/CloudSyncView';
import { ExtensionPackagerModal } from './components/ExtensionPackagerModal';
import { BackupModal } from './components/BackupModal';
import { NewProfileModal } from './components/NewProfileModal';
import { DocsModal } from './components/DocsModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { SecurityWhitelistModal } from './components/SecurityWhitelistModal';
import { TakeoverGuidanceModal } from './components/TakeoverGuidanceModal';
import { DEFAULT_SECURITY_BYPASS } from './utils/securityWhitelist';
import { testProxyLatency } from './utils/healthCheck';
import { registerConsoleApi } from './utils/devConsoleApi';
import { applyWorkspacePort } from './utils/workspacePresets';
import { FixedProfile, ProxyHealthStatus, SecurityBypassConfig } from './types/omega';

const STORAGE_KEY = 'proxypilot_profiles_v2';
const ACTIVE_KEY = 'proxypilot_active_id_v2';
const THEME_KEY = 'proxypilot_theme_v1';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ProxyPilot] Failed loading saved profiles from localStorage, using defaults:', e);
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_KEY);
      if (saved) return saved;
    } catch {}
    return 'auto_switch';
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>('auto_switch');
  const [currentTab, setCurrentTab] = useState<'profiles' | 'inspector' | 'simulator' | 'pac' | 'cloud' | 'backup'>('profiles');

  // Modals & Popups
  const [isPopupOpen, setIsPopupOpen] = useState(false); // default closed so mobile isn't blocked on load
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPackagerOpen, setIsPackagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isTakeoverGuidanceOpen, setIsTakeoverGuidanceOpen] = useState(false);

  const isExtensionContext = typeof window !== 'undefined' && 
    Boolean((window as any).chrome?.proxy?.settings);

  const handleSetActiveProfile = (id: string) => {
    setActiveProfileId(id);
    const target = profiles.find(p => p.id === id);
    if (!isExtensionContext) {
      showToast(`网页模拟已激活「${target?.name || id}」(真实接管请加载扩展)`);
      setIsTakeoverGuidanceOpen(true);
    } else {
      showToast(`🚀 已成功切换并接管底层代理: ${target?.name || id}！`);
    }
  };

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [securityConfig, setSecurityConfig] = useState<SecurityBypassConfig>(() => {
    try {
      const s = localStorage.getItem('proxypilot_sec_bypass');
      if (s) return JSON.parse(s);
    } catch {}
    return DEFAULT_SECURITY_BYPASS;
  });
  const [healthStatus, setHealthStatus] = useState<Record<string, ProxyHealthStatus>>({});
  const [isTestingPing, setIsTestingPing] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // On mount: sync with chrome.storage.local if available (extension mode)
  useEffect(() => {
    try {
      const chromeObj = (window as any).chrome;
      if (chromeObj?.storage?.local) {
        chromeObj.storage.local.get(['profiles', 'activeProfileId', 'theme'], (res: any) => {
          if (res?.profiles && Array.isArray(res.profiles) && res.profiles.length > 0) {
            setProfiles(res.profiles);
          }
          if (res?.activeProfileId) {
            setActiveProfileId(res.activeProfileId);
          }
          if (res?.theme && (res.theme === 'dark' || res.theme === 'light')) {
            setTheme(res.theme);
          }
        });
      }
    } catch (e) {
      console.warn('[ProxyPilot] Failed loading from chrome.storage.local:', e);
    }
  }, []);

  // Sync theme with documentElement & storage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      const chromeObj = (window as any).chrome;
      if (chromeObj?.storage?.local) {
        chromeObj.storage.local.set({ theme });
      }
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync with localStorage & chrome.storage.local
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      const chromeObj = (window as any).chrome;
      if (chromeObj?.storage?.local) {
        chromeObj.storage.local.set({ profiles });
      }
    } catch {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeProfileId);
      const chromeObj = (window as any).chrome;
      if (chromeObj?.storage?.local) {
        chromeObj.storage.local.set({ activeProfileId });
        chromeObj.runtime?.sendMessage?.({
          type: 'SWITCH_PROFILE',
          profileId: activeProfileId
        });
      }
    } catch {}
  }, [activeProfileId]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateProfile = (updated: Profile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    setHasUnsavedChanges(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (['direct', 'system'].includes(id)) {
      alert('直接连接与系统代理为内置基础情景模式，无法删除。');
      return;
    }
    if (confirm('确定要删除此情景模式吗？所有引用该模式的分流规则可能会失效。')) {
      const remaining = profiles.filter(p => p.id !== id);
      setProfiles(remaining);
      if (selectedProfileId === id) {
        setSelectedProfileId(remaining[0]?.id || 'direct');
      }
      if (activeProfileId === id) {
        setActiveProfileId(remaining[0]?.id || 'direct');
      }
      showToast('已删除情景模式');
    }
  };

  const handleAddProfile = (newProfile: Profile) => {
    setProfiles(prev => [...prev, newProfile]);
    setSelectedProfileId(newProfile.id);
    setCurrentTab('profiles');
    showToast(`成功创建情景模式: ${newProfile.name}`);
  };

  const handleApplyChanges = () => {
    setHasUnsavedChanges(false);
    showToast('已保存并应用全部情景模式设置');
  };

  const handleResetProfiles = () => {
    if (confirm('确定要恢复默认预设的情景模式吗？当前的自定义修改将被覆盖。')) {
      setProfiles(DEFAULT_PROFILES);
      setSelectedProfileId('auto_switch');
      setActiveProfileId('auto_switch');
      setHasUnsavedChanges(false);
      showToast('已重置为系统默认情景模式');
    }
  };

  const handleAddRuleToAutoSwitchFromPopup = (pattern: string, targetProfileId: string) => {
    setProfiles(prev => {
      return prev.map(p => {
        if (p.profileType === 'SwitchProfile') {
          return {
            ...p,
            rules: [
              {
                id: 'rule_' + Date.now(),
                conditionType: 'HostWildcardCondition',
                pattern,
                profileId: targetProfileId,
                enabled: true,
                note: '由扩展弹窗快捷添加',
              },
              ...p.rules,
            ],
          };
        }
        return p;
      });
    });
    setHasUnsavedChanges(true);
    showToast(`已添加分流规则: ${pattern}`);
  };

  const handlePingAllProxies = async () => {
    setIsTestingPing(true);
    const fixedProfs = profiles.filter(p => p.profileType === 'FixedProfile') as FixedProfile[];
    const results: Record<string, ProxyHealthStatus> = { ...healthStatus };
    for (const fp of fixedProfs) {
      results[fp.id] = { profileId: fp.id, status: 'checking' };
    }
    setHealthStatus({ ...results });

    for (const fp of fixedProfs) {
      const res = await testProxyLatency(fp);
      results[fp.id] = res;
      setHealthStatus({ ...results });
    }
    setIsTestingPing(false);
    showToast('已完成全部代理节点握手测速');
  };

  useEffect(() => {
    registerConsoleApi(profiles, activeProfileId, {
      setActiveProfileId: (id) => {
        setActiveProfileId(id);
        showToast(`已切换生效情景至: ${id}`);
      },
      onAddRule: (pattern, profileId) => {
        handleAddRuleToAutoSwitchFromPopup(pattern, profileId);
        showToast(`已在自动切换添加规则: ${pattern}`);
      },
      onSetPort: (port) => {
        const updated = applyWorkspacePort(profiles, port);
        setProfiles(updated);
        showToast(`已批量更新端口至: ${port}`);
      },
      onPingAll: handlePingAllProxies,
    });
  }, [profiles, activeProfileId]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract (3 zones) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeProfileId={activeProfileId}
        setActiveProfileId={handleSetActiveProfile}
        profiles={profiles}
        togglePopup={() => setIsPopupOpen(!isPopupOpen)}
        isPopupOpen={isPopupOpen}
        onOpenPackager={() => setIsPackagerOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
        onApplyChanges={handleApplyChanges}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(prev => !prev)}
      />

      {/* Real-time Proxy Takeover Environment & Diagnostic Bar */}
      <ProxyTakeoverBanner
        activeProfile={profiles.find(p => p.id === activeProfileId) || profiles[0]}
        profiles={profiles}
        onOpenPackager={() => setIsPackagerOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onSelectTab={setCurrentTab}
        onOpenTakeoverGuidance={() => setIsTakeoverGuidanceOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Only in profiles tab) */}
        {currentTab === 'profiles' && (
          <Sidebar
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            activeProfileId={activeProfileId}
            onSetActiveProfile={handleSetActiveProfile}
            onOpenNewProfileModal={() => setIsNewProfileOpen(true)}
            onOpenBackupModal={() => setIsBackupOpen(true)}
            onOpenDocsModal={() => setIsDocsOpen(true)}
            onOpenWorkspaces={() => setIsWorkspaceOpen(true)}
            onOpenSecurityWhitelist={() => setIsSecurityOpen(true)}
            onPingAll={handlePingAllProxies}
            healthStatus={healthStatus}
            isTestingPing={isTestingPing}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-6 pb-28 md:pb-6 transition-colors">
          <div className="max-w-5xl mx-auto">
            {/* Mobile Quick Profile Ribbon */}
            {currentTab === 'profiles' && (
              <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 select-none scroll-smooth">
                {profiles.map(p => {
                  const isSelected = p.id === selectedProfileId;
                  const isActive = p.id === activeProfileId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`shrink-0 min-h-[34px] flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 active:scale-95'
                      }`}
                    >
                      <span 
                        className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : ''}`}
                        style={{ backgroundColor: isSelected ? '#ffffff' : (p.color || '#3b82f6') }}
                      />
                      <span className="truncate max-w-[120px]">{p.name}</span>
                      {isActive && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          生效
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsNewProfileOpen(true)}
                  className="shrink-0 min-h-[34px] flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新建</span>
                </button>
              </div>
            )}

            {/* View: Profiles Settings */}
            {currentTab === 'profiles' && selectedProfile && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-6 shadow-xs">
                {selectedProfile.profileType === 'FixedProfile' && (
                  <ProfileProxyEditor
                    profile={selectedProfile}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                    isActive={selectedProfile.id === activeProfileId}
                    onSetActive={() => handleSetActiveProfile(selectedProfile.id)}
                    isExtensionContext={isExtensionContext}
                    onOpenTakeoverGuidance={() => setIsTakeoverGuidanceOpen(true)}
                  />
                )}

                {selectedProfile.profileType === 'SwitchProfile' && (
                  <ProfileAutoSwitchEditor
                    profile={selectedProfile}
                    allProfiles={profiles}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                    isActive={selectedProfile.id === activeProfileId}
                    onSetActive={() => handleSetActiveProfile(selectedProfile.id)}
                    isExtensionContext={isExtensionContext}
                    onOpenTakeoverGuidance={() => setIsTakeoverGuidanceOpen(true)}
                  />
                )}

                {selectedProfile.profileType === 'PacProfile' && (
                  <ProfilePacEditor
                    profile={selectedProfile}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                    isActive={selectedProfile.id === activeProfileId}
                    onSetActive={() => handleSetActiveProfile(selectedProfile.id)}
                    isExtensionContext={isExtensionContext}
                    onOpenTakeoverGuidance={() => setIsTakeoverGuidanceOpen(true)}
                  />
                )}

                {selectedProfile.profileType === 'VirtualProfile' && (
                  <ProfileVirtualEditor
                    profile={selectedProfile}
                    allProfiles={profiles}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                  />
                )}

                {/* Built-in Direct Profile View */}
                {selectedProfile.profileType === 'DirectProfile' && (
                  <div className="space-y-4">
                    {/* Takeover status */}
                    {selectedProfile.id === activeProfileId ? (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span>✅ 当前浏览器正处于直接连接 (不走代理)</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                                DIRECT
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                              所有网络请求直连目标服务器，无代理中转
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          直连生效中
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                          <div className="text-xs text-slate-700 dark:text-slate-300">
                            当前未启用直接连接 (目前生效: <strong>{profiles.find(p => p.id === activeProfileId)?.name}</strong>)
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveProfileId('direct');
                            showToast('🚀 已将浏览器设为直接连接模式！');
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>⚡ 设为当前模式 (直连)</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-4 h-4 rounded-sm bg-slate-500 shrink-0" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedProfile.name}
                      </h2>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        直接连接网络 (Direct Connection)
                      </p>
                      <p>
                        在此情景模式下，浏览器发起的所有网络请求都将直接发送至目标服务器，不使用任何代理通道，也不受其他分流规则影响。
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        该模式为内置基础情景模式，常作为自动切换模式中的默认回退或白名单目标。
                      </p>
                    </div>
                  </div>
                )}

                {/* Built-in System Profile View */}
                {selectedProfile.profileType === 'SystemProfile' && (
                  <div className="space-y-4">
                    {/* Takeover status */}
                    {selectedProfile.id === activeProfileId ? (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span>✅ 当前浏览器正继承操作系统代理 (系统代理)</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                                SYSTEM
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                              遵循 Windows/macOS/Linux 操作系统的网络代理设置
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          系统代理生效中
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                          <div className="text-xs text-slate-700 dark:text-slate-300">
                            当前未启用系统代理 (目前生效: <strong>{profiles.find(p => p.id === activeProfileId)?.name}</strong>)
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveProfileId('system');
                            showToast('🚀 已将浏览器设为使用系统代理模式！');
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>⚡ 设为当前模式 (系统)</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-4 h-4 rounded-sm bg-sky-600 shrink-0" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedProfile.name}
                      </h2>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        使用系统代理设置 (Use System Proxy Settings)
                      </p>
                      <p>
                        在此情景模式下，浏览器将继承并遵守操作系统（Windows 网络设置、macOS 网络代理或 Linux 环境变量）的全局代理配置。
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        适合希望在系统托盘代理客户端（如 Clash TUN、V2RayN 系统代理）统一控制时使用。
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback if profile not recognized */}
                {!['FixedProfile', 'SwitchProfile', 'PacProfile', 'VirtualProfile', 'DirectProfile', 'SystemProfile'].includes(selectedProfile.profileType) && (
                  <div className="p-8 text-center space-y-4">
                    <p className="text-slate-500">情景模式数据异常或未配置。</p>
                    <button
                      onClick={handleResetProfiles}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                    >
                      恢复默认预设情景
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'profiles' && !selectedProfile && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-xs">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  未检测到情景模式或本地存储已被重置。
                </p>
                <button
                  onClick={handleResetProfiles}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  一键载入默认预设情景模式 (7897 端口)
                </button>
              </div>
            )}

            {/* View: Route Simulator */}
            {currentTab === 'simulator' && (
              <RouteSimulator
                profiles={profiles}
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
              />
            )}

            {/* View: Request Inspector (Real-time network traffic & debug) */}
            {currentTab === 'inspector' && (
              <RequestInspector
                profiles={profiles}
                activeProfileId={activeProfileId}
                onAddRule={(pattern, targetProfileId) => {
                  handleAddRuleToAutoSwitchFromPopup(pattern, targetProfileId);
                  showToast(`已一键添加分流规则: ${pattern}`);
                }}
              />
            )}

            {/* View: Cloud Sync & Clash Rules */}
            {currentTab === 'cloud' && (
              <CloudSyncView
                profiles={profiles}
                activeProfileId={activeProfileId}
                onImportProfiles={(imported) => {
                  setProfiles(imported);
                  setSelectedProfileId(imported[0]?.id || 'direct');
                  showToast(`成功从云端导入 ${imported.length} 个情景模式`);
                }}
                onUpdateProfiles={(updated) => {
                  setProfiles(updated);
                  setHasUnsavedChanges(true);
                  showToast('已更新情景模式规则');
                }}
              />
            )}

            {/* View: PAC Code Generator */}
            {currentTab === 'pac' && (
              <PacCodeViewer
                profiles={profiles}
                activeProfileId={activeProfileId}
              />
            )}

            {/* View: Backup & Presets */}
            {currentTab === 'backup' && (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    备份导入、导出与软件预设
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    管理您的 ProxyPilot 备份数据，或快速载入 Clash / V2Ray / 开发者常用网络环境。
                  </p>
                </div>
                <button
                  onClick={() => setIsBackupOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  打开备份管理窗口
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Floating Quick Switcher Popup */}
        <QuickSwitcherPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectActiveProfile={(id) => {
            setActiveProfileId(id);
            showToast(`当前生效情景已切换至: ${profiles.find(p => p.id === id)?.name}`);
          }}
          onOpenOptions={() => {
            setCurrentTab('profiles');
            setIsPopupOpen(false);
          }}
          onAddRuleToAutoSwitch={handleAddRuleToAutoSwitchFromPopup}
        />
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white border border-slate-800 dark:border-slate-700 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Extension Packager Modal (.ZIP downloader) */}
      <ExtensionPackagerModal
        isOpen={isPackagerOpen}
        onClose={() => setIsPackagerOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
      />

      {/* Backup Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        profiles={profiles}
        onImportProfiles={(imported) => {
          setProfiles(imported);
          setSelectedProfileId(imported[0]?.id || 'direct');
          showToast(`已成功导入 ${imported.length} 个情景模式`);
        }}
        onResetProfiles={handleResetProfiles}
      />

      {/* New Profile Modal */}
      <NewProfileModal
        isOpen={isNewProfileOpen}
        onClose={() => setIsNewProfileOpen(false)}
        onAddProfile={handleAddProfile}
        existingProfiles={profiles}
      />

      {/* Docs Modal */}
      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Workspace Preset Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        profiles={profiles}
        onApplyProfiles={(updated) => {
          setProfiles(updated);
          setHasUnsavedChanges(true);
        }}
      />

      {/* Security Whitelist Modal */}
      <SecurityWhitelistModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        config={securityConfig}
        onSaveConfig={(updated) => {
          setSecurityConfig(updated);
          localStorage.setItem('proxypilot_sec_bypass', JSON.stringify(updated));
          showToast('隐私安全白名单设置已生效并保存');
        }}
      />

      {/* Takeover Guidance Modal */}
      <TakeoverGuidanceModal
        isOpen={isTakeoverGuidanceOpen}
        onClose={() => setIsTakeoverGuidanceOpen(false)}
        activeProfile={profiles.find(p => p.id === activeProfileId) || profiles[0]}
        onOpenPackager={() => {
          setIsTakeoverGuidanceOpen(false);
          setIsPackagerOpen(true);
        }}
      />
    </div>
  );
}
