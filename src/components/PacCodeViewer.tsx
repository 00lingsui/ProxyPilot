import React, { useState } from 'react';
import { Download, Copy, Check, Code2, RefreshCw, Zap, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import { Profile } from '../types/omega';
import { generatePacScript } from '../utils/pacGenerator';
import { compileGfwlistToPac, compileCuratedGfwlistPac, GFWLIST_MIRRORS } from '../utils/gfwlistPacCompiler';

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
  const [generationMode, setGenerationMode] = useState<'profile' | 'gfwlist'>('gfwlist');
  
  // GFWList compilation state
  const [proxyStatement, setProxyStatement] = useState('SOCKS5 127.0.0.1:7897; DIRECT');
  const [selectedMirror, setSelectedMirror] = useState(GFWLIST_MIRRORS[0].url);
  const [customMirror, setCustomMirror] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [compiledGfwlistPac, setCompiledGfwlistPac] = useState<string>(() => compileCuratedGfwlistPac('SOCKS5 127.0.0.1:7897; DIRECT'));

  // Interactive Test
  const [testUrl, setTestUrl] = useState('https://www.google.com');
  const [testResult, setTestResult] = useState<{
    proxy: string;
    isProxy: boolean;
    latencyMs: number;
    matchedDomain?: string;
  } | null>(null);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];
  const profilePacCode = generatePacScript(selectedProfile, profiles);
  const currentPacCode = generationMode === 'gfwlist' ? compiledGfwlistPac : profilePacCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPacCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentPacCode], { type: 'application/x-ns-proxy-autoconfig' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generationMode === 'gfwlist' ? 'gfwlist_smart.pac' : `proxy_${selectedProfile.id}.pac`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncGfwlist = async () => {
    setIsSyncing(true);
    setSyncStatus('正在连接 GFWList 镜像源同步最新规则...');

    const mirrorUrl = selectedMirror === 'custom' ? customMirror.trim() : selectedMirror;
    const result = await compileGfwlistToPac(mirrorUrl, proxyStatement);

    setIsSyncing(false);
    if (result.success) {
      setCompiledGfwlistPac(result.pacScript);
      setSyncStatus(`已成功同步并编译 GFWList！包含 ${result.domainCount.toLocaleString()} 个被墙域名及 ${result.whitelistCount} 条直连白名单 (${result.sourceLabel})`);
    } else {
      setSyncStatus(`同步失败: ${result.error}，建议切换镜像源或使用离线精选库`);
    }
  };

  const handleLoadCurated = () => {
    const pac = compileCuratedGfwlistPac(proxyStatement);
    setCompiledGfwlistPac(pac);
    setSyncStatus('已成功载入精选 GFWList 核心离线规则库 (4,430+ 域名)');
  };

  const runTest = (urlToTest: string) => {
    const start = performance.now();
    try {
      let hostname = '';
      try {
        const parsed = new URL(urlToTest.includes('://') ? urlToTest : `https://${urlToTest}`);
        hostname = parsed.hostname.toLowerCase();
      } catch {
        hostname = urlToTest.toLowerCase();
      }

      // Execute in sandbox function
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const evalFn = new Function(`
        ${currentPacCode}
        return FindProxyForURL("${urlToTest.replace(/"/g, '\\"')}", "${hostname.replace(/"/g, '\\"')}");
      `);

      const ret = evalFn();
      const latency = Math.round((performance.now() - start) * 100) / 100;
      setTestResult({
        proxy: ret,
        isProxy: ret !== 'DIRECT',
        latencyMs: latency,
        matchedDomain: hostname,
      });
    } catch (err: any) {
      setTestResult({
        proxy: `执行异常: ${err.message}`,
        isProxy: false,
        latencyMs: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-500" />
            PAC 智能分流脚本生成器 (GFWList 字典级优化)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            将当前分流策略或权威 GFWList 规则库编译为纯 ASCII 高性能 JavaScript FindProxyForURL 函数，完美兼容 Chrome/Edge、iOS、Android 及路由器。
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

      {/* Generator Mode Tabs */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        <button
          onClick={() => setGenerationMode('gfwlist')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            generationMode === 'gfwlist'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-pink-500" />
          <span>⚡ 基于 GFWList 权威规则库同步生成 (推荐 · 4,400+ 域名高速哈希查找)</span>
        </button>

        <button
          onClick={() => setGenerationMode('profile')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            generationMode === 'profile'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-sky-500" />
          <span>基于当前自定义情景模式规则编译</span>
        </button>
      </div>

      {/* GFWList Configuration Panel */}
      {generationMode === 'gfwlist' && (
        <div className="bg-white dark:bg-slate-900/90 border border-pink-200/60 dark:border-pink-900/40 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                GFWList 同步编译配置项
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                纯 ASCII 规范 · O(1) 后缀树查询
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadCurated}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                📋 载入精选离线库 (4,430+ 域名)
              </button>
              <button
                onClick={handleSyncGfwlist}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-pink-600 hover:bg-pink-500 text-white shadow-2xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '同步中...' : '⚡ 立即同步 GFWList 编译'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                代理出口语句 (FindProxyForURL 命中代理时的返回值):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={proxyStatement}
                  onChange={(e) => setProxyStatement(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  placeholder="SOCKS5 127.0.0.1:7897; DIRECT"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setProxyStatement('SOCKS5 127.0.0.1:7897; DIRECT')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Clash 7897 (SOCKS5)
                </button>
                <button
                  type="button"
                  onClick={() => setProxyStatement('PROXY 127.0.0.1:7897; DIRECT')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Clash 7897 (HTTP)
                </button>
                <button
                  type="button"
                  onClick={() => setProxyStatement('SOCKS5 127.0.0.1:10808; DIRECT')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  v2rayN 10808 (SOCKS5)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                GFWList 规则镜像源 (Mirror Source):
              </label>
              <select
                value={selectedMirror}
                onChange={(e) => setSelectedMirror(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden mb-2"
              >
                {GFWLIST_MIRRORS.map(m => (
                  <option key={m.url} value={m.url}>
                    {m.name} ({m.url.slice(0, 48)}...)
                  </option>
                ))}
                <option value="custom">自定义订阅源地址...</option>
              </select>

              {selectedMirror === 'custom' && (
                <input
                  type="text"
                  value={customMirror}
                  onChange={(e) => setCustomMirror(e.target.value)}
                  placeholder="https://your-mirror-source/gfwlist.txt"
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {syncStatus && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs border border-pink-200 dark:border-pink-900/60 font-mono">
              <ShieldCheck className="w-4 h-4 shrink-0 text-pink-500" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* Profile Selector (When in Profile Mode) */}
      {generationMode === 'profile' && (
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
      )}

      {/* Interactive Simulation Sandbox */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-emerald-500" />
          PAC 脚本实时仿真测试沙盒 (Live Test Runner)
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runTest(testUrl)}
            placeholder="输入任意测试网址，例如 https://www.google.com 或 http://192.168.1.1"
            className="flex-1 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
          <button
            onClick={() => runTest(testUrl)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>运行测试</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] text-slate-400">快速测试:</span>
          {['https://www.google.com', 'https://github.com', 'https://www.baidu.com', 'http://192.168.1.1', 'http://localhost:3000'].map(chip => (
            <button
              key={chip}
              onClick={() => { setTestUrl(chip); runTest(chip); }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {chip.replace(/^https?:\/\//, '')}
            </button>
          ))}
        </div>

        {testResult && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                testResult.isProxy ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                {testResult.isProxy ? '走代理通道' : '直连 (DIRECT)'}
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                返回值: <code className="font-semibold text-blue-600 dark:text-blue-400">{testResult.proxy}</code>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              耗时: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{testResult.latencyMs}ms</span>
            </div>
          </div>
        )}
      </div>

      {/* PAC Code Display */}
      <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-pink-400" />
            <span className="font-mono text-slate-200 font-semibold">
              {generationMode === 'gfwlist' ? 'gfwlist_smart.pac' : 'proxy.pac'}
            </span>
            <span>· Standard FindProxyForURL(url, host)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {currentPacCode.split('\n').length.toLocaleString()} lines · 100% Pure ASCII
          </span>
        </div>

        <div className="p-4 max-h-[460px] overflow-auto">
          <pre className="font-mono text-xs text-slate-100 leading-relaxed">
            <code>{currentPacCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

