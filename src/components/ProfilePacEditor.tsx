import React, { useState } from 'react';
import { FileCode, Trash2, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { PacProfile } from '../types/omega';

interface ProfilePacEditorProps {
  profile: PacProfile;
  onChange: (updated: PacProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfilePacEditor: React.FC<ProfilePacEditorProps> = ({
  profile,
  onChange,
  onDeleteProfile,
}) => {
  const [pacMode, setPacMode] = useState<'url' | 'inline'>(profile.pacUrl ? 'url' : 'inline');
  const [syntaxValid, setSyntaxValid] = useState<boolean | null>(null);

  const handleValidateScript = () => {
    try {
      const fn = new Function('url', 'host', profile.pacScript || '');
      setSyntaxValid(true);
    } catch {
      setSyntaxValid(false);
    }
  };

  const handleResetScript = () => {
    onChange({
      ...profile,
      pacScript: `function FindProxyForURL(url, host) {
  // 本地直接连接
  if (isPlainHostName(host) || shExpMatch(host, "*.local") || host === "127.0.0.1") {
    return "DIRECT";
  }

  // 智能分流
  if (shExpMatch(host, "*.google.com") || shExpMatch(host, "*.github.com")) {
    return "SOCKS5 127.0.0.1:7897; DIRECT";
  }

  return "DIRECT";
}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: profile.color || '#ec4899' }}
            />
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 rounded transition-colors bg-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            通过标准 PAC (Proxy Auto-Config) 脚本根据 JavaScript 逻辑动态返回代理服务器。
          </p>
        </div>

        <button
          onClick={() => onDeleteProfile(profile.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>删除</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-2xs">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              checked={pacMode === 'url'}
              onChange={() => setPacMode('url')}
              className="text-blue-600 focus:ring-0"
            />
            <span>PAC 网址 (PAC URL)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              checked={pacMode === 'inline'}
              onChange={() => setPacMode('inline')}
              className="text-blue-600 focus:ring-0"
            />
            <span>自定义脚本 (Inline PAC Script)</span>
          </label>
        </div>

        {pacMode === 'url' ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              PAC 脚本网址 (支持 http://, https://, file://)
            </label>
            <input
              type="text"
              value={profile.pacUrl || ''}
              onChange={(e) => onChange({ ...profile, pacUrl: e.target.value })}
              placeholder="http://127.0.0.1:7897/proxy.pac"
              className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                标准 FindProxyForURL(url, host) 函数定义
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetScript}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>恢复模板</span>
                </button>
                <button
                  type="button"
                  onClick={handleValidateScript}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 rounded transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>检查语法</span>
                </button>
              </div>
            </div>

            {syntaxValid !== null && (
              <div className={`p-2.5 rounded text-xs flex items-center gap-2 ${syntaxValid ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{syntaxValid ? '语法检查通过：函数结构有效。' : '语法错误：PAC 脚本中存在 JavaScript 语法错误。'}</span>
              </div>
            )}

            <textarea
              rows={14}
              value={profile.pacScript || ''}
              onChange={(e) => {
                onChange({ ...profile, pacScript: e.target.value });
                setSyntaxValid(null);
              }}
              className="w-full font-mono text-xs bg-slate-900 text-sky-300 p-4 rounded-lg focus:outline-hidden leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
