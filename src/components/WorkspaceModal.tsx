import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  Zap, 
  Globe, 
  Cpu, 
  Radio, 
  Building, 
  Home, 
  Plane, 
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Profile } from '../types/omega';
import { DEFAULT_WORKSPACES, applyWorkspacePort } from '../utils/workspacePresets';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onApplyProfiles: (updated: Profile[]) => void;
  currentPort?: number;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onApplyProfiles,
  currentPort = 7897,
}) => {
  const [selectedId, setSelectedId] = useState<string>('clash_verge');
  const [customPort, setCustomPort] = useState<number>(currentPort);
  const [useCustomPort, setUseCustomPort] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-blue-500" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'Radio': return <Radio className="w-5 h-5 text-emerald-500" />;
      case 'Building': return <Building className="w-5 h-5 text-indigo-500" />;
      case 'Home': return <Home className="w-5 h-5 text-teal-500" />;
      case 'Plane': return <Plane className="w-5 h-5 text-rose-500" />;
      default: return <Layers className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleApply = () => {
    const targetPreset = DEFAULT_WORKSPACES.find(w => w.id === selectedId);
    const targetPort = useCustomPort ? customPort : (targetPreset?.defaultPort || 7897);

    const updated = applyWorkspacePort(profiles, targetPort);
    onApplyProfiles(updated);
    setToastMsg(`已将所有代理情景端口一键同步为 ${targetPort}！`);
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                工作空间与场景预设 (Workspaces & Scenes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                一键快速切换客户端端口与工作/家庭/漫游网络环境
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEFAULT_WORKSPACES.map(w => {
              const isSelected = selectedId === w.id && !useCustomPort;
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedId(w.id);
                    setUseCustomPort(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {getIcon(w.icon)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {w.name}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                          默认端口: {w.defaultPort}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {w.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Custom Port Switcher */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div 
              onClick={() => setUseCustomPort(!useCustomPort)}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                useCustomPort 
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  自定义批量代理端口
                </span>
              </div>
              <input
                type="checkbox"
                checked={useCustomPort}
                onChange={(e) => setUseCustomPort(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {useCustomPort && (
              <div className="mt-3 flex items-center gap-3 px-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">将所有代理情景模式端口变更为:</span>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(parseInt(e.target.value, 10) || 7897)}
                  className="w-28 px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  placeholder="如 7897"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            将自动更新所有 FixedProfile 节点的端口设置
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              <span>立即应用场景</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
