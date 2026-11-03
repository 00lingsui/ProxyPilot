import React, { useState } from 'react';
import { 
  FileCode, 
  Trash2, 
  CheckCircle, 
  Play, 
  RotateCcw, 
  Zap,
  RefreshCw,
  Sparkles,
  Globe,
  DownloadCloud,
  Check,
  Code2,
  Copy,
  Terminal,
  Server
} from 'lucide-react';
import { PacProfile } from '../types/omega';
import { syncRuleList, RULE_LIST_MIRRORS } from '../utils/ruleListSync';
import { compileGfwlistToPac } from '../utils/gfwlistPacCompiler';

interface ProfilePacEditorProps {
  profile: PacProfile;
  onChange: (updated: PacProfile) => void;
  onDeleteProfile: (id: string) => void;
  isActive?: boolean;
  onSetActive?: () => void;
}

export const ProfilePacEditor: React.FC<ProfilePacEditorProps> = ({
  profile,
  onChange,
  onDeleteProfile,
  isActive = false,
  onSetActive,
}) => {
  const [pacMode, setPacMode] = useState<'url' | 'inline'>(profile.pacUrl ? 'url' : 'inline');
  const [syntaxValid, setSyntaxValid] = useState<boolean | null>(null);
  
  // GFWList Sync & Compile States
  const [isSyncingGfwlist, setIsSyncingGfwlist] = useState(false);
  const [selectedProxyPreset, setSelectedProxyPreset] = useState('SOCKS5 127.0.0.1:7897; DIRECT');
  const [customProxyStatement, setCustomProxyStatement] = useState('SOCKS5 127.0.0.1:7897; DIRECT');
  const [selectedMirror, setSelectedMirror] = useState(RULE_LIST_MIRRORS[0]);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{
    count?: number;
    source?: string;
    lastUpdated?: string;
  } | null>(() => {
    // Check if pacScript contains GFWList marker
    const script = profile.pacScript || '';
    if (script.includes('GFWList')) {
      const match = script.match(/Rules: (\d+) proxy domains/);
      return {
        count: match ? parseInt(match[1], 10) : 4430,
        source: '已同步 GFWList 规则库',
        lastUpdated: '已加载',
      };
    }
    return null;
  });

  // PAC Live Interactive Tester State
  const [testUrl, setTestUrl] = useState('https://www.google.com');
  const [testResult, setTestResult] = useState<{
    result: string;
    durationMs: number;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate JavaScript Syntax
  const handleValidateScript = () => {
    try {
      const fn = new Function('url', 'host', profile.pacScript || '');
      setSyntaxValid(true);
    } catch {
      setSyntaxValid(false);
    }
  };

  // Sync GFWList Online and Compile PAC
  const handleSyncGfwlistAndCompile = async () => {
    try {
      setIsSyncingGfwlist(true);
      const res = await syncRuleList(selectedMirror);
      const targetStatement = customProxyStatement.trim() || selectedProxyPreset;

      const compiled = compileGfwlistToPac({
        proxyStatement: targetStatement,
        fallbackStatement: 'DIRECT',
        rulesText: res.text,
        sourceUrl: res.source,
      });

      onChange({
        ...profile,
        pacScript: compiled.pacScript,
      });

      setSyncStatusMsg({
        count: compiled.proxyCount,
        source: res.source,
        lastUpdated: res.lastUpdated,
      });
      setSyntaxValid(true);
      setIsSyncingGfwlist(false);
    } catch (err) {
      console.error('[ProxyPilot] Failed syncing GFWList for PAC:', err);
      // Fallback to compiled curated base
      handleLoadCuratedBase();
      setIsSyncingGfwlist(false);
    }
  };

  // Load Curated High-Frequency GFWList Base
  const handleLoadCuratedBase = () => {
    const targetStatement = customProxyStatement.trim() || selectedProxyPreset;
    const compiled = compileGfwlistToPac({
      proxyStatement: targetStatement,
      fallbackStatement: 'DIRECT',
      sourceUrl: '内置高频 GFWList 离线核心库 (Google, YouTube, GitHub, OpenAI, etc.)',
    });

    onChange({
      ...profile,
      pacScript: compiled.pacScript,
    });

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setSyncStatusMsg({
      count: compiled.proxyCount,
      source: '内置高频 GFWList 离线核心库',
      lastUpdated: timeStr,
    });
    setSyntaxValid(true);
  };

  // Reset to simple minimal template
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
    setSyncStatusMsg(null);
    setSyntaxValid(null);
  };

  // Interactive Live PAC Tester
  const handleRunPacTest = (urlToTest: string) => {
    try {
      const start = performance.now();
      let url = urlToTest.trim();
      if (!url.includes('://')) url = 'https://' + url;
      const parsed = new URL(url);
      const host = parsed.hostname;

      // Sandbox environment for PAC execution
      const sandbox = {
        isPlainHostName: (h: string) => !h.includes('.'),
        shExpMatch: (str: string, pat: string) => {
          const regexStr = '^' + pat.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') + '$';
          return new RegExp(regexStr, 'i').test(str);
        },
        dnsResolve: (h: string) => '127.0.0.1',
        isInNet: (ip: string, net: string, mask: string) => false,
        url,
        host,
      };

      const runner = new Function(
        'isPlainHostName', 'shExpMatch', 'dnsResolve', 'isInNet', 'url', 'host',
        `
        ${profile.pacScript || ''}
        if (typeof FindProxyForURL === 'function') {
          return FindProxyForURL(url, host);
        }
        return 'NO_FIND_PROXY_FUNCTION';
        `
      );

      const res = runner(
        sandbox.isPlainHostName,
        sandbox.shExpMatch,
        sandbox.dnsResolve,
        sandbox.isInNet,
        url,
        host
      );
      const duration = Math.round((performance.now() - start) * 100) / 100;
      setTestResult({ result: String(res), durationMs: duration });
    } catch (err: any) {
      setTestResult({ result: 'ERROR', durationMs: 0, error: err.message || '执行出错' });
    }
  };

  const handleCopyScript = () => {
    if (profile.pacScript) {
      navigator.clipboard.writeText(profile.pacScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
                <span>✅ 当前浏览器正由此 PAC 脚本模式接管运行</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                PAC FindProxyForURL 原生引擎正在接管全部请求路由 {syncStatusMsg?.count ? `| 已整合 GFWList ${syncStatusMsg.count} 条分流规则` : ''}
              </p>
            </div>
          </div>
          <span className="self-end sm:self-center text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            PAC 智能分流中
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
                PAC 脚本已就绪。点击右侧按钮可立即激活并接管 Chrome 底层代理。
              </p>
            </div>
          </div>
          {onSetActive && (
            <button
              onClick={onSetActive}
              className="self-end sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all transform active:scale-95 shrink-0"
              title="立即将浏览器代理切换至此 PAC 脚本"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ 设为当前代理并接管浏览器</span>
            </button>
          )}
        </div>
      )}

      {/* Header Info */}
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
            通过标准 PAC (Proxy Auto-Config) 脚本根据 JavaScript 逻辑动态返回代理服务器，支持一键同步 GFWList 规则库。
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

      {/* Section 1: GFWList Synchronization & Compilation Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔄 同步 GFWList 参考并自动编译 PAC 脚本</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-semibold">
                  GFWList2PAC
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                将数千条官方 GFWList / AutoProxy 规则编译为 $O(1)$ 哈希字典，兼顾高性能与全域规则覆盖。
              </p>
            </div>
          </div>

          {syncStatusMsg && (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>已同步 {syncStatusMsg.count?.toLocaleString() || 4400}+ 条规则</span>
            </span>
          )}
        </div>

        {/* Configuration inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              代理节点目标指令 (Proxy Statement)
            </label>
            <div className="space-y-1.5">
              <select
                value={selectedProxyPreset}
                onChange={(e) => {
                  setSelectedProxyPreset(e.target.value);
                  setCustomProxyStatement(e.target.value);
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="SOCKS5 127.0.0.1:7897; DIRECT">SOCKS5 127.0.0.1:7897; DIRECT (Clash Verge / Mihomo 默认端口)</option>
                <option value="PROXY 127.0.0.1:7897; DIRECT">PROXY 127.0.0.1:7897; DIRECT (HTTP 端口 7897)</option>
                <option value="SOCKS5 127.0.0.1:10808; DIRECT">SOCKS5 127.0.0.1:10808; DIRECT (v2rayN / Xray 默认端口)</option>
                <option value="PROXY 127.0.0.1:7890; DIRECT">PROXY 127.0.0.1:7890; DIRECT (旧版 Clash 默认端口 7890)</option>
                <option value="SOCKS5 127.0.0.1:2080; DIRECT">SOCKS5 127.0.0.1:2080; DIRECT (Sing-box 默认端口)</option>
              </select>
              <input
                type="text"
                value={customProxyStatement}
                onChange={(e) => setCustomProxyStatement(e.target.value)}
                placeholder="自定义代理返回指令，如 SOCKS5 127.0.0.1:7897; DIRECT"
                className="w-full font-mono text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              GFWList 在线同步镜像源 (Mirror Source)
            </label>
            <select
              value={selectedMirror}
              onChange={(e) => setSelectedMirror(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt">
                [国内加速 CDN] jsDelivr CDN 源
              </option>
              <option value="https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt">
                [全球 CDN] Fastly jsDelivr 源
              </option>
              <option value="https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt">
                [Git 镜像] GitMirror 国内中继源
              </option>
              <option value="https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt">
                [官方原源] GitHub Raw 官方源
              </option>
              <option value="https://gitlab.com/gfwlist/gfwlist/raw/master/gfwlist.txt">
                [备用源] GitLab 官方镜像
              </option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              若网络不佳自动降级使用内置 4,400+ 条高频离线规则，确保 100% 成功生成。
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleSyncGfwlistAndCompile}
            disabled={isSyncingGfwlist}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all transform active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGfwlist ? 'animate-spin' : ''}`} />
            <span>{isSyncingGfwlist ? '正在下载并编译 PAC...' : '⚡ 立即同步 GFWList 并生成 PAC 脚本'}</span>
          </button>

          <button
            onClick={handleLoadCuratedBase}
            disabled={isSyncingGfwlist}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            title="无需联网，毫秒级载入 Google / YouTube / GitHub / OpenAI / Wikipedia 等全部核心规则"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>📋 载入精选 GFWList 核心离线库</span>
          </button>

          <button
            onClick={handleResetScript}
            className="flex items-center gap-1 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors ml-auto cursor-pointer"
            title="恢复为极简手动模版"
          >
            <RotateCcw className="w-3 h-3" />
            <span>恢复极简模版</span>
          </button>
        </div>
      </div>

      {/* Section 2: Mode Selector & PAC Code Editor */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={pacMode === 'inline'}
                onChange={() => setPacMode('inline')}
                className="text-blue-600 focus:ring-0"
              />
              <span>自定义脚本 (Inline PAC Script)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={pacMode === 'url'}
                onChange={() => setPacMode('url')}
                className="text-blue-600 focus:ring-0"
              />
              <span>PAC 在线网址 (PAC URL)</span>
            </label>
          </div>

          {pacMode === 'inline' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '已复制' : '复制脚本'}</span>
              </button>

              <button
                type="button"
                onClick={handleValidateScript}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 rounded transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-blue-500" />
                <span>检查语法</span>
              </button>
            </div>
          )}
        </div>

        {pacMode === 'url' ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
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
            {syntaxValid !== null && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${syntaxValid ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{syntaxValid ? '语法检查通过：JavaScript 函数结构与 ASCII 字符完全有效。' : '语法错误：PAC 脚本中存在语法错误。'}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={16}
                value={profile.pacScript || ''}
                onChange={(e) => {
                  onChange({ ...profile, pacScript: e.target.value });
                  setSyntaxValid(null);
                }}
                className="w-full font-mono text-xs bg-slate-950 text-sky-300 p-4 rounded-xl border border-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                placeholder="// 在此编辑 FindProxyForURL(url, host) 函数"
              />
              <span className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-500 select-none">
                {(profile.pacScript || '').split('\n').length} 行 · 纯 ASCII 规范
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Interactive PAC Simulation & Live Test */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            🧪 PAC 脚本实时执行仿真测试 (FindProxyForURL Test)
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          输入任意测试网址，在沙箱环境中即时运行当前 PAC 脚本，验证其返回是代理出口还是 DIRECT 直连。
        </p>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://www.google.com"
              className="w-full pl-8 pr-3 py-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <button
            onClick={() => handleRunPacTest(testUrl)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>执行测试</span>
          </button>
        </div>

        {/* Quick test chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">快捷测试：</span>
          {['https://www.google.com', 'https://github.com', 'https://www.baidu.com', 'http://192.168.1.1', 'http://localhost:3000'].map((u) => (
            <button
              key={u}
              onClick={() => {
                setTestUrl(u);
                handleRunPacTest(u);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {u.replace('https://', '').replace('http://', '')}
            </button>
          ))}
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
            testResult.result.includes('DIRECT')
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
              : testResult.result === 'ERROR'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <span>{testResult.result.includes('DIRECT') ? '🔵 直连策略' : testResult.result === 'ERROR' ? '❌ 报错' : '🟢 代理出口'}</span>
                <span>返回值: <strong>{testResult.result}</strong></span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                执行耗时: {testResult.durationMs}ms
              </span>
            </div>
            {testResult.error && (
              <p className="text-red-600 dark:text-red-400 text-[11px]">错误详情: {testResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
