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
  AlertCircle
} from 'lucide-react';
import { Profile } from './types/omega';
import { DEFAULT_PROFILES } from './utils/defaultData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProfileProxyEditor } from './components/ProfileProxyEditor';
import { ProfileAutoSwitchEditor } from './components/ProfileAutoSwitchEditor';
import { ProfilePacEditor } from './components/ProfilePacEditor';
import { ProfileVirtualEditor } from './components/ProfileVirtualEditor';
import { QuickSwitcherPopup } from './components/QuickSwitcherPopup';
import { RouteSimulator } from './components/RouteSimulator';
import { PacCodeViewer } from './components/PacCodeViewer';
import { ExtensionPackagerModal } from './components/ExtensionPackagerModal';
import { BackupModal } from './components/BackupModal';
import { NewProfileModal } from './components/NewProfileModal';
import { DocsModal } from './components/DocsModal';

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
      if (saved) return JSON.parse(saved);
    } catch {}
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
  const [currentTab, setCurrentTab] = useState<'profiles' | 'simulator' | 'pac' | 'backup'>('profiles');

  // Modals & Popups
  const [isPopupOpen, setIsPopupOpen] = useState(false); // default closed so mobile isn't blocked on load
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPackagerOpen, setIsPackagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with documentElement
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeProfileId);
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

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract (3 zones) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeProfileId={activeProfileId}
        setActiveProfileId={(id) => {
          setActiveProfileId(id);
          showToast(`当前生效情景已切换至: ${profiles.find(p => p.id === id)?.name}`);
        }}
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

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Only in profiles tab) */}
        {currentTab === 'profiles' && (
          <Sidebar
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            activeProfileId={activeProfileId}
            onSetActiveProfile={(id) => {
              setActiveProfileId(id);
              showToast(`当前生效情景已切换至: ${profiles.find(p => p.id === id)?.name}`);
            }}
            onOpenNewProfileModal={() => setIsNewProfileOpen(true)}
            onOpenBackupModal={() => setIsBackupOpen(true)}
            onOpenDocsModal={() => setIsDocsOpen(true)}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-6 pb-24 md:pb-6 transition-colors">
          <div className="max-w-5xl mx-auto">
            {/* View: Profiles Settings */}
            {currentTab === 'profiles' && selectedProfile && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
                {selectedProfile.profileType === 'FixedProfile' && (
                  <ProfileProxyEditor
                    profile={selectedProfile}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                  />
                )}

                {selectedProfile.profileType === 'SwitchProfile' && (
                  <ProfileAutoSwitchEditor
                    profile={selectedProfile}
                    allProfiles={profiles}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                  />
                )}

                {selectedProfile.profileType === 'PacProfile' && (
                  <ProfilePacEditor
                    profile={selectedProfile}
                    onChange={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
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
    </div>
  );
}
