import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  Check
} from 'lucide-react';
import { Profile } from '../types/omega';
import { PRESET_TEMPLATES } from '../utils/defaultData';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onImportProfiles: (profiles: Profile[]) => void;
  onResetProfiles: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onImportProfiles,
  onResetProfiles,
}) => {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [presetApplied, setPresetApplied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const backupData = {
      app: 'ProxyPilot',
      version: '1.0.0',
      schemaVersion: 2,
      exportDate: new Date().toISOString(),
      profiles: profiles,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProxyPilotOptions_${new Date().toISOString().slice(0, 10)}.bak`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importText);
      const importedProfiles = parsed.profiles || (Array.isArray(parsed) ? parsed : null);
      if (importedProfiles && Array.isArray(importedProfiles)) {
        onImportProfiles(importedProfiles);
        setImportStatus('成功导入 ' + importedProfiles.length + ' 个情景模式！');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('解析失败：无效的备份格式。');
      }
    } catch {
      setImportStatus('JSON 格式错误，请检查文本。');
    }
  };

  const handleApplyPreset = (presetId: string) => {
    if (presetId === 'clash') {
      const updated = profiles.map(p => {
        if (p.id === 'proxy_clash' && p.profileType === 'FixedProfile') {
          return {
            ...p,
            name: 'Clash (7897 SOCKS5)',
            fallbackProxy: { scheme: 'socks5' as const, host: '127.0.0.1', port: 7897 }
          };
        }
        return p;
      });
      onImportProfiles(updated);
      setPresetApplied('已成功应用 Clash 预设配置');
    } else if (presetId === 'v2ray') {
      const updated = profiles.map(p => {
        if (p.id === 'proxy_http' && p.profileType === 'FixedProfile') {
          return {
            ...p,
            name: 'V2Ray (10808 SOCKS5)',
            fallbackProxy: { scheme: 'socks5' as const, host: '127.0.0.1', port: 10808 }
          };
        }
        return p;
      });
      onImportProfiles(updated);
      setPresetApplied('已成功应用 V2Ray 预设配置');
    }
    setTimeout(() => setPresetApplied(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold tracking-tight">
              导入 / 导出与预设规则中心
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {presetApplied && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{presetApplied}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              常用代理软件一键预设 (Quick Presets)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3.5 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl space-y-2 bg-slate-50 dark:bg-slate-800/80 transition-colors"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {tpl.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tpl.description}
                  </p>
                  <button
                    onClick={() => handleApplyPreset(tpl.id)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium transition-colors"
                  >
                    载入此预设
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              导出配置备份 (Export Backup)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              导出兼容原生 SwitchyOmega 与 ProxyPilot 的 <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.bak</code> JSON 格式备份文件。
            </p>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>生成并下载备份文件 (.bak)</span>
            </button>
          </div>

          {/* Import section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              导入配置 (Import JSON Backup)
            </h3>
            <textarea
              rows={4}
              placeholder="在此粘贴已有的 .bak 或 JSON 备份数据..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            {importStatus && (
              <div className={`text-xs p-2 rounded ${importStatus.includes('成功') ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300'}`}>
                {importStatus}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={handleImportJson}
                disabled={!importText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>确认导入配置</span>
              </button>

              <button
                onClick={onResetProfiles}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>恢复初始默认情景模式</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
