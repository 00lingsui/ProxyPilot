import React, { useState } from 'react';
import { 
  Play, 
  Globe, 
  Terminal, 
  Activity,
  Layers
} from 'lucide-react';
import { Profile } from '../types/omega';
import { simulateRoute } from '../utils/matcher';

interface RouteSimulatorProps {
  profiles: Profile[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

export const RouteSimulator: React.FC<RouteSimulatorProps> = ({
  profiles,
  activeProfileId,
  setActiveProfileId,
}) => {
  const [testUrl, setTestUrl] = useState('https://github.com/torvalds/linux');
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [batchUrlsText, setBatchUrlsText] = useState(`https://www.google.com/search?q=switchyomega
https://github.com/explore
http://localhost:3000
http://192.168.1.1
https://gitlab.internal.corp/team/repo
https://www.bilibili.com
https://twitter.com/elonmusk
https://api.openai.com/v1/models`);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const simulation = simulateRoute(testUrl, activeProfileId, profiles);

  const presets = [
    { label: 'GitHub (7897 加速)', url: 'https://github.com/torvalds/linux' },
    { label: 'Google (外网服务)', url: 'https://www.google.com/search?q=test' },
    { label: 'Localhost (本地绕过)', url: 'http://localhost:3000/api' },
    { label: '局域网 192.168.*', url: 'http://192.168.1.100:8080/admin' },
    { label: '企业内网 (*.internal.corp)', url: 'https://jira.internal.corp/browse/DEV-101' },
    { label: 'Bilibili (国内直连)', url: 'https://www.bilibili.com' },
    { label: 'OpenAI (GFWList分流)', url: 'https://api.openai.com/v1/chat' },
  ];

  const batchResults = batchUrlsText
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean)
    .map(u => simulateRoute(u, activeProfileId, profiles));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            路由分流模拟器 (Routing Rule Simulator)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            在沙箱环境中实时模拟浏览器网络请求的分流走向，检验通配符、正则、白名单以及默认回退规则的执行结果。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">当前测试使用的情景:</span>
          <select
            value={activeProfileId}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.profileType})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Segmented Controls */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'single'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          单 URL 深度追踪 (Single Trace)
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'batch'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          批量 URL 压力验证 (Batch Matrix)
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="space-y-6">
          {/* Address Bar */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              模拟浏览器访问地址 (Test Request URL)
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="输入任意要测试的网址，例如 https://www.google.com"
                  className="w-full bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setTestUrl(testUrl.trim())}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>立即模拟解析</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-400 dark:text-slate-500">快速填入典型用例:</span>
              {presets.map(preset => (
                <button
                  key={preset.url}
                  onClick={() => setTestUrl(preset.url)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Flow Pipeline */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              分流拓扑路径 (Routing Flow Topology)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Step 1: Client Request */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">1. 发起请求</span>
                <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={simulation.parsedUrl.hostname}>
                  {simulation.parsedUrl.hostname}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {simulation.parsedUrl.protocol}//:{simulation.parsedUrl.port}
                </div>
              </div>

              {/* Step 2: Active Profile & Pipeline */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">2. 生效情景模式</span>
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: simulation.activeProfile.color || '#3b82f6' }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {simulation.activeProfile.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {simulation.activeProfile.profileType}
                </div>
              </div>

              {/* Step 3: Match Decision */}
              <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-1">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">3. 规则匹配判定</span>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 truncate">
                  {simulation.matchedRule ? (
                    `命中: ${simulation.matchedRule.pattern}`
                  ) : simulation.matchedRuleList ? (
                    '命中在线规则列表'
                  ) : simulation.matchedBypass ? (
                    `绕过: ${simulation.matchedBypass.pattern}`
                  ) : (
                    '默认回退 (Default)'
                  )}
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                  {simulation.matchedRule?.conditionType || 'Fallback'}
                </div>
              </div>

              {/* Step 4: Final Proxy Destination */}
              <div className={`border rounded-lg p-3 text-center space-y-1 ${
                simulation.isDirect 
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700' 
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700'
              }`}>
                <span className={`text-[10px] font-bold uppercase ${
                  simulation.isDirect ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-700 dark:text-emerald-300'
                }`}>
                  4. 路由终点
                </span>
                <div className={`text-xs font-bold truncate ${
                  simulation.isDirect ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-800 dark:text-emerald-200'
                }`}>
                  {simulation.finalProxySummary}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  延迟预估: ~{simulation.latencyMs}ms
                </div>
              </div>
            </div>

            {/* PAC Directive Box */}
            <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono border border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">PAC 脚本返回值:</span>
                <span className="text-emerald-300 font-bold">{simulation.pacStatement}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                RFC-compliant FindProxyForURL return string
              </span>
            </div>
          </div>

          {/* Execution Trace Logs */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                分流执行追踪日志 (Execution Trace)
              </h3>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-lg font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto leading-relaxed border border-slate-800">
              {simulation.resolutionTrace.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-slate-500 select-none">{String(index + 1).padStart(2, '0')}.</span>
                  <span className={
                    log.includes('命中') 
                      ? 'text-emerald-400 font-semibold' 
                      : log.includes('终点') 
                      ? 'text-sky-300 font-semibold' 
                      : log.includes('警告') 
                      ? 'text-amber-400' 
                      : 'text-slate-300'
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Batch URL Routing Matrix */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                批量测试 URL 列表 (每行一个网址)
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                共 {batchResults.length} 个测试目标
              </span>
            </div>

            <textarea
              rows={6}
              value={batchUrlsText}
              onChange={(e) => setBatchUrlsText(e.target.value)}
              className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              placeholder="每行输入一个完整的 URL..."
            />
          </div>

          {/* Matrix Results Table */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">测试目标域名 (Host)</th>
                    <th className="py-2.5 px-3">匹配规则项 (Matched Rule)</th>
                    <th className="py-2.5 px-3">分流结果 (Destination)</th>
                    <th className="py-2.5 px-3">PAC 指令</th>
                    <th className="py-2.5 px-3 text-right">预估延迟</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                  {batchResults.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {res.parsedUrl.hostname}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {res.matchedRule ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {res.matchedRule.pattern}
                          </span>
                        ) : res.matchedRuleList ? (
                          <span className="text-emerald-600 dark:text-emerald-400">GFWList 在线规则</span>
                        ) : res.matchedBypass ? (
                          <span className="text-slate-500">Bypass: {res.matchedBypass.pattern}</span>
                        ) : (
                          <span className="text-slate-400">默认直连回退</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          res.isDirect 
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {res.finalProxySummary}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {res.pacStatement}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                        {res.latencyMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
