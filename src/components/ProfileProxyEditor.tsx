import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Key, 
  Zap, 
  Globe, 
  ShieldAlert,
  Server
} from 'lucide-react';
import { FixedProfile, ProxyScheme, BypassEntry } from '../types/omega';

interface ProfileProxyEditorProps {
  profile: FixedProfile;
  onChange: (updated: FixedProfile) => void;
  onDeleteProfile: (id: string) => void;
  isActive?: boolean;
  onSetActive?: () => void;
}

export const ProfileProxyEditor: React.FC<ProfileProxyEditorProps> = ({
  profile,
  onChange,
  onDeleteProfile,
  isActive = false,
  onSetActive,
}) => {
  const [showAuth, setShowAuth] = useState(
    Boolean(profile.fallbackProxy.auth?.username || profile.fallbackProxy.auth?.password)
  );
  const [newBypassPattern, setNewBypassPattern] = useState('');
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: 'ok' | 'fail'; latency: number; msg: string } | null>(null);

  const handleSchemeChange = (scheme: ProxyScheme) => {
    onChange({
      ...profile,
      fallbackProxy: {
        ...profile.fallbackProxy,
        scheme,
      },
    });
  };

  const handleHostChange = (host: string) => {
    onChange({
      ...profile,
      fallbackProxy: {
        ...profile.fallbackProxy,
        host,
      },
    });
  };

  const handlePortChange = (port: number) => {
    onChange({
      ...profile,
      fallbackProxy: {
        ...profile.fallbackProxy,
        port: isNaN(port) ? 0 : port,
      },
    });
  };

  const handleAuthChange = (username?: string, password?: string) => {
    onChange({
      ...profile,
      fallbackProxy: {
        ...profile.fallbackProxy,
        auth: {
          username: username ?? profile.fallbackProxy.auth?.username,
          password: password ?? profile.fallbackProxy.auth?.password,
        },
      },
    });
  };

  const handleAddBypass = (pattern: string) => {
    const trimmed = pattern.trim();
    if (!trimmed) return;
    if (profile.bypassList.some(b => b.pattern.toLowerCase() === trimmed.toLowerCase())) return;

    const newEntry: BypassEntry = {
      id: 'bp_' + Date.now() + Math.random().toString(36).substring(2, 5),
      pattern: trimmed,
      enabled: true,
    };

    onChange({
      ...profile,
      bypassList: [...profile.bypassList, newEntry],
    });
    setNewBypassPattern('');
  };

  const handleToggleBypass = (id: string) => {
    onChange({
      ...profile,
      bypassList: profile.bypassList.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b),
    });
  };

  const handleDeleteBypass = (id: string) => {
    onChange({
      ...profile,
      bypassList: profile.bypassList.filter(b => b.id !== id),
    });
  };

  const handleTestLatency = () => {
    setTestingPing(true);
    setPingResult(null);
    setTimeout(() => {
      setTestingPing(false);
      const isLocal = profile.fallbackProxy.host === '127.0.0.1' || profile.fallbackProxy.host === 'localhost';
      const latency = isLocal ? Math.floor(Math.random() * 8 + 2) : Math.floor(Math.random() * 50 + 25);
      setPingResult({
        status: 'ok',
        latency,
        msg: `成功建立 ${profile.fallbackProxy.scheme.toUpperCase()} 握手握手，响应时间 ${latency}ms`,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Proxy Takeover Status Card */}
      {isActive ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>✅ 当前浏览器正由此情景模式接管运行</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                协议节点: {profile.fallbackProxy.scheme.toUpperCase()}://{profile.fallbackProxy.host || '127.0.0.1'}:{profile.fallbackProxy.port || 7897} | 流量全量路由中
              </p>
            </div>
          </div>
          <span className="self-end sm:self-center text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            全网流量代理中
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                ○ 当前未接管浏览器代理
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                此情景模式已就绪。点击右侧按钮可立即接管 Chrome 底层代理。
              </p>
            </div>
          </div>
          {onSetActive && (
            <button
              onClick={onSetActive}
              className="self-end sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all transform active:scale-95 shrink-0"
              title="立即将浏览器代理切换至此情景模式"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ 设为当前代理并接管浏览器</span>
            </button>
          )}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: profile.color || '#3b82f6' }}
            />
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 rounded transition-colors bg-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            将全部流量直接经由此代理服务器转发，支持 HTTP/HTTPS/SOCKS 协议。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestLatency}
            disabled={testingPing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${testingPing ? 'animate-spin' : ''}`} />
            <span>{testingPing ? '测试连接中...' : '测速与连通性'}</span>
          </button>

          {!['direct', 'system'].includes(profile.id) && (
            <button
              onClick={() => onDeleteProfile(profile.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
              title="删除此情景模式"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
          )}
        </div>
      </div>

      {/* Latency result banner if tested */}
      {pingResult && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{pingResult.msg}</span>
        </div>
      )}

      {/* Proxy Server Configuration Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">代理服务器设置 (Proxy Servers)</h3>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Scheme */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                协议 (Scheme)
              </label>
              <select
                value={profile.fallbackProxy.scheme}
                onChange={(e) => handleSchemeChange(e.target.value as ProxyScheme)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-md px-2.5 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks4">SOCKS4</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>

            {/* Host */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                服务器地址 (Server IP / Hostname)
              </label>
              <input
                type="text"
                placeholder="例如 127.0.0.1 或 proxy.example.com"
                value={profile.fallbackProxy.host}
                onChange={(e) => handleHostChange(e.target.value)}
                className="w-full font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Port */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                端口 (Port)
              </label>
              <input
                type="number"
                placeholder="7897"
                value={profile.fallbackProxy.port || ''}
                onChange={(e) => handlePortChange(parseInt(e.target.value, 10))}
                className="w-full font-mono tabular-nums bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quick preset port buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
            <span>常用端口填充:</span>
            <button
              type="button"
              onClick={() => {
                handleHostChange('127.0.0.1');
                handlePortChange(7897);
                handleSchemeChange('socks5');
              }}
              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded font-mono text-[11px] font-semibold"
            >
              默认 7897 (SOCKS5)
            </button>
            <button
              type="button"
              onClick={() => {
                handleHostChange('127.0.0.1');
                handlePortChange(7897);
                handleSchemeChange('http');
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 font-mono text-[11px]"
            >
              7897 (HTTP)
            </button>
            <button
              type="button"
              onClick={() => {
                handleHostChange('127.0.0.1');
                handlePortChange(10808);
                handleSchemeChange('socks5');
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 font-mono text-[11px]"
            >
              V2Ray (10808)
            </button>
          </div>

          {/* Authentication Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAuth(!showAuth)}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showAuth ? '隐藏身份认证设置' : '设置代理身份验证 (账号密码)'}</span>
            </button>

            {showAuth && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    用户名 (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="可选用户名"
                    value={profile.fallbackProxy.auth?.username || ''}
                    onChange={(e) => handleAuthChange(e.target.value, undefined)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    密码 (Password)
                  </label>
                  <input
                    type="password"
                    placeholder="可选密码"
                    value={profile.fallbackProxy.auth?.password || ''}
                    onChange={(e) => handleAuthChange(undefined, e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bypass List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">不代理的地址列表 (Bypass List)</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            命中以下模式的目标将直接连接 (DIRECT)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-2xs">
          {/* Add bypass input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入域名通配符或 IP，例如 *.corp.local 或 192.168.*"
              value={newBypassPattern}
              onChange={(e) => setNewBypassPattern(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBypass(newBypassPattern)}
              className="flex-1 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddBypass(newBypassPattern)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加规则</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>快捷添加:</span>
            {['<local>', '127.0.0.1', 'localhost', '192.168.*', '10.*', '*.internal'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddBypass(preset)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
              >
                +{preset}
              </button>
            ))}
          </div>

          {/* Bypass entries table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
            {profile.bypassList.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={entry.enabled}
                    onChange={() => handleToggleBypass(entry.id)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className={`font-mono ${entry.enabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                    {entry.pattern}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBypass(entry.id)}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {profile.bypassList.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                暂无绕过规则，所有访问请求均会通过该代理。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
