import React, { useState } from 'react';
import { Download, Copy, Check, Code2 } from 'lucide-react';
import { Profile } from '../types/omega';
import { generatePacScript } from '../utils/pacGenerator';

interface PacCodeViewerProps {
  profiles: Profile[];
  activeProfileId: string;
}

export const PacCodeViewer: React.FC<PacCodeViewerProps> = ({
  profiles,
  activeProfileId,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfileId);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];
  const pacCode = generatePacScript(selectedProfile, profiles);

  const handleCopy = () => {
    navigator.clipboard.writeText(pacCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pacCode], { type: 'application/x-ns-proxy-autoconfig' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxy_${selectedProfile.id}.pac`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            PAC 智能分流脚本 (Proxy Auto-Config Generator)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            将当前 ProxyPilot 的情景模式、通配符规则、绕过清单动态编译为标准 RFC PAC 脚本，可直接应用于操作系统、路由器或手机 Wi-Fi。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制脚本' : '复制 PAC 代码'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载 proxy.pac</span>
          </button>
        </div>
      </div>

      {/* Target Profile Selector */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">生成基于哪个情景模式:</span>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.profileType})
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          (推荐选择具有分流规则的 "自动切换" 模式)
        </span>
      </div>

      {/* PAC Code Display */}
      <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="font-mono text-slate-200 font-semibold">proxy.pac</span>
            <span>· Standard FindProxyForURL(url, host)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {pacCode.split('\n').length} lines · UTF-8
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs text-slate-100 leading-relaxed">
            <code>{pacCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
