import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Plus, 
  Check, 
  Globe, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Profile } from '../types/omega';
import { simulateRoute } from '../utils/matcher';

interface QuickSwitcherPopupProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
  onSelectActiveProfile: (id: string) => void;
  onOpenOptions: () => void;
  onAddRuleToAutoSwitch: (pattern: string, targetProfileId: string) => void;
}

export const QuickSwitcherPopup: React.FC<QuickSwitcherPopupProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectActiveProfile,
  onOpenOptions,
  onAddRuleToAutoSwitch,
}) => {
  const [currentTabUrl, setCurrentTabUrl] = useState('https://github.com/torvalds/linux');
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [targetProxyForRule, setTargetProxyForRule] = useState<string>(
    profiles.find(p => p.profileType === 'FixedProfile')?.id || 'proxy_clash'
  );
  const [addedToast, setAddedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  let hostname = 'github.com';
  try {
    hostname = new URL(currentTabUrl).hostname;
  } catch {
    hostname = currentTabUrl;
  }

  // Calculate live route simulation for current tab in popup
  const simulation = simulateRoute(currentTabUrl, activeProfileId, profiles);
  const suggestedPattern = '*.' + hostname.replace(/^www\./, '');

  const handleAddRule = () => {
    onAddRuleToAutoSwitch(suggestedPattern, targetProxyForRule);
    setShowAddRuleForm(false);
    setAddedToast(`已成功添加规则: ${suggestedPattern}`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="fixed top-15 sm:top-18 right-3 sm:right-6 left-3 sm:left-auto max-w-[340px] mx-auto z-50 w-full sm:w-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden font-sans select-none animate-in fade-in duration-200">
      {/* Extension Toolbar Popup Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/40" />
          <span className="text-xs font-bold tracking-tight">ProxyPilot 扩展弹窗</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenOptions}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="打开完整选项配置"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-slate-50 dark:bg-slate-900/90">
        {/* Simulated Browser Active Tab */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">当前活动标签页 (Active Tab)</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">SIMULATED</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={currentTabUrl}
              onChange={(e) => setCurrentTabUrl(e.target.value)}
              className="w-full bg-transparent font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-hidden"
              placeholder="输入当前标签页测试网址"
            />
          </div>

          {/* Quick Match Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500 dark:text-slate-400">分流路径:</span>
            <span className={`font-mono font-medium px-1.5 py-0.2 rounded text-[11px] ${
              simulation.isDirect 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {simulation.finalProxySummary}
            </span>
          </div>

          {simulation.matchedRule && (
            <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate">
              命中规则: <code className="font-mono">{simulation.matchedRule.pattern}</code>
            </div>
          )}
        </div>

        {/* Quick Notification Toast */}
        {addedToast && (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{addedToast}</span>
          </div>
        )}

        {/* Profiles List */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            选择生效情景模式
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto">
            {profiles.map(p => {
              const isSelected = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectActiveProfile(p.id)}
                  className={`min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-blue-500 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#3b82f6' }}
                    />
                    <span className="truncate">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1-Click Quick Add Rule for Current Domain */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
          {!showAddRuleForm ? (
            <button
              onClick={() => setShowAddRuleForm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>对此域名添加自动切换规则</span>
            </button>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 space-y-2">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                添加规则至自动切换模式
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">匹配模式</label>
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                  {suggestedPattern}
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">目标情景模式</label>
                <select
                  value={targetProxyForRule}
                  onChange={(e) => setTargetProxyForRule(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 focus:outline-hidden"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddRule}
                  className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  确认保存规则
                </button>
                <button
                  onClick={() => setShowAddRuleForm(false)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>ProxyPilot v1.0</span>
        <button
          onClick={onOpenOptions}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          <span>选项设置</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
