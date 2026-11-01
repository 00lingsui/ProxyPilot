import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Trash2, 
  Pause, 
  Play, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldAlert, 
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { Profile, RequestLogItem, SwitchProfile } from '../types/omega';
import { simulateRoute } from '../utils/matcher';

interface RequestInspectorProps {
  profiles: Profile[];
  activeProfileId: string;
  onAddRule: (pattern: string, targetProfileId: string) => void;
}

const SAMPLE_REQUEST_DOMAINS = [
  { url: 'https://github.com/microsoft/vscode', method: 'GET', type: 'main_frame' },
  { url: 'https://api.github.com/user/repos', method: 'GET', type: 'xmlhttprequest' },
  { url: 'https://www.google.com/search?q=proxypilot', method: 'GET', type: 'main_frame' },
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', method: 'GET', type: 'media' },
  { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', method: 'GET', type: 'image' },
  { url: 'https://en.wikipedia.org/wiki/Proxy_server', method: 'GET', type: 'main_frame' },
  { url: 'https://api.openai.com/v1/chat/completions', method: 'POST', type: 'xmlhttprequest' },
  { url: 'https://192.168.1.1/api/router/status', method: 'GET', type: 'xmlhttprequest' },
  { url: 'https://gitlab.internal.corp/deploy', method: 'POST', type: 'xmlhttprequest' },
  { url: 'wss://gateway.discord.gg/?v=9&encoding=json', method: 'GET', type: 'websocket' },
  { url: 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js', method: 'GET', type: 'script' },
  { url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt', method: 'GET', type: 'xmlhttprequest' },
];

export const RequestInspector: React.FC<RequestInspectorProps> = ({
  profiles,
  activeProfileId,
  onAddRule,
}) => {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'proxy' | 'direct' | 'error'>('all');
  const [selectedLog, setSelectedLog] = useState<RequestLogItem | null>(null);
  const [ruleModalOpen, setRuleModalOpen] = useState<boolean>(false);
  const [targetRulePattern, setTargetRulePattern] = useState<string>('');
  const [targetRuleProfileId, setTargetRuleProfileId] = useState<string>('proxy_clash');

  // Helper: Create a simulated or captured request entry evaluated against active profiles
  const createLogItem = (url: string, method: string, type: string): RequestLogItem => {
    let hostname = '';
    let port = '443';
    let scheme = 'https';
    try {
      const u = new URL(url);
      hostname = u.hostname;
      port = u.port || (u.protocol === 'https:' ? '443' : '80');
      scheme = u.protocol.replace(':', '');
    } catch {
      hostname = url.split('/')[2] || url;
    }

    const sim = simulateRoute(url, activeProfileId, profiles);
    const isDirect = sim.isDirect;
    const isError = !isDirect && Math.random() < 0.08; // small simulation probability for offline proxy

    let matchedDesc = '默认情景回退';
    let ruleType = 'Fallback';
    let pattern = '*';

    if (sim.matchedRule) {
      matchedDesc = `规则: ${sim.matchedRule.pattern} (${sim.matchedRule.note || sim.matchedRule.conditionType})`;
      ruleType = sim.matchedRule.conditionType;
      pattern = sim.matchedRule.pattern;
    } else if (sim.matchedRuleList) {
      matchedDesc = '命中 GFWList 在线分流规则表';
      ruleType = 'OnlineRuleList';
      pattern = `*.${hostname.split('.').slice(-2).join('.')}`;
    } else if (sim.matchedBypass) {
      matchedDesc = `Bypass 白名单: ${sim.matchedBypass.pattern}`;
      ruleType = 'Bypass';
      pattern = sim.matchedBypass.pattern;
    }

    return {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      url,
      method,
      type,
      host: hostname,
      port,
      scheme,
      matchedRuleDescription: matchedDesc,
      matchedRuleType: ruleType,
      matchedPattern: pattern,
      targetProfileId: sim.effectiveProfile.id,
      targetProfileName: sim.effectiveProfile.name,
      proxySummary: sim.finalProxySummary,
      status: isError ? 'ERR_CONNECTION_REFUSED' : 200,
      durationMs: isDirect ? Math.floor(Math.random() * 25 + 8) : Math.floor(Math.random() * 80 + 35),
    };
  };

  // Seed with initial realistic traffic
  useEffect(() => {
    const initialLogs: RequestLogItem[] = SAMPLE_REQUEST_DOMAINS.slice(0, 7).map(item =>
      createLogItem(item.url, item.method, item.type)
    );
    setLogs(initialLogs);
  }, [activeProfileId]);

  // Periodic mock traffic when capturing is enabled
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const randomSample = SAMPLE_REQUEST_DOMAINS[Math.floor(Math.random() * SAMPLE_REQUEST_DOMAINS.length)];
      // Add slight cache-buster param
      const url = randomSample.url.includes('?') 
        ? `${randomSample.url}&_t=${Date.now()}` 
        : `${randomSample.url}?_t=${Date.now()}`;
      
      const newEntry = createLogItem(url, randomSample.method, randomSample.type);
      setLogs(prev => [newEntry, ...prev.slice(0, 199)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isCapturing, activeProfileId, profiles]);

  const handleSimulateNewTraffic = () => {
    const randomSample = SAMPLE_REQUEST_DOMAINS[Math.floor(Math.random() * SAMPLE_REQUEST_DOMAINS.length)];
    const newEntry = createLogItem(randomSample.url, randomSample.method, randomSample.type);
    setLogs(prev => [newEntry, ...prev.slice(0, 199)]);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          log.url.toLowerCase().includes(q) ||
          log.host.toLowerCase().includes(q) ||
          (log.matchedRuleDescription && log.matchedRuleDescription.toLowerCase().includes(q)) ||
          log.targetProfileName.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (filterType === 'proxy') {
        return log.targetProfileId !== 'direct';
      }
      if (filterType === 'direct') {
        return log.targetProfileId === 'direct';
      }
      if (filterType === 'error') {
        return log.status !== 200;
      }
      return true;
    });
  }, [logs, searchQuery, filterType]);

  const handleOpenAddRuleModal = (log: RequestLogItem) => {
    const wildcard = log.host.startsWith('www.')
      ? `*.${log.host.slice(4)}`
      : `*.${log.host}`;
    setTargetRulePattern(wildcard);
    setTargetRuleProfileId(log.targetProfileId === 'direct' ? 'proxy_clash' : 'direct');
    setSelectedLog(log);
    setRuleModalOpen(true);
  };

  const handleConfirmAddRule = () => {
    if (!targetRulePattern.trim()) return;
    onAddRule(targetRulePattern.trim(), targetRuleProfileId);
    setRuleModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                实时分流诊断与抓包日志 (Request Inspector)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              实时追踪浏览器发起的每一个网络请求、完整匹配链条与最终代理节点，支持被阻断请求一键添加规则。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCapturing(!isCapturing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isCapturing
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              }`}
            >
              {isCapturing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isCapturing ? '暂停抓包' : '开始抓包'}</span>
            </button>

            <button
              onClick={handleSimulateNewTraffic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="模拟触发一次网络请求并回溯分流规则"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>触发测试请求</span>
            </button>

            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="清空当前抓包记录"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">清空</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索域名、URL 或匹配规则..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              全部 ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('proxy')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'proxy'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              走代理 ({logs.filter(l => l.targetProfileId !== 'direct').length})
            </button>
            <button
              onClick={() => setFilterType('direct')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'direct'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              直连 ({logs.filter(l => l.targetProfileId === 'direct').length})
            </button>
            <button
              onClick={() => setFilterType('error')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'error'
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              异常/失败 ({logs.filter(l => l.status !== 200).length})
            </button>
          </div>
        </div>
      </div>

      {/* Request Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3 w-16">状态</th>
                <th className="py-2.5 px-3 w-16">方法</th>
                <th className="py-2.5 px-3 min-w-[200px]">目标请求 URL</th>
                <th className="py-2.5 px-3 min-w-[170px]">分流规则回溯 (Matched Rule)</th>
                <th className="py-2.5 px-3 min-w-[150px]">生效代理节点</th>
                <th className="py-2.5 px-3 w-20 text-right">耗时</th>
                <th className="py-2.5 px-3 w-24 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    暂无匹配的抓包请求记录。在上方点击「触发测试请求」即可观察分流回溯。
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => {
                  const isSuccess = item.status === 200;
                  const isProxy = item.targetProfileId !== 'direct';

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(item)}
                    >
                      <td className="py-2 px-3">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            200 OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            FAILED
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          {item.method}
                        </span>
                      </td>

                      <td className="py-2 px-3 truncate max-w-xs font-sans">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.host}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">
                          {item.url}
                        </div>
                      </td>

                      <td className="py-2 px-3 font-sans">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={item.matchedRuleDescription}>
                            {item.matchedRuleDescription}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-3 font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          isProxy
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.targetProfileName}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right text-slate-500 text-[11px]">
                        {item.durationMs}ms
                      </td>

                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenAddRuleModal(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded text-[11px] font-sans font-medium transition-colors"
                          title="将此域名一键添加至自动切换规则"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>加规则</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Creation Modal */}
      {ruleModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                一键添加分流规则
              </h3>
              <button
                onClick={() => setRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                关闭
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">匹配模式 (Wildcard Pattern)</label>
                <input
                  type="text"
                  value={targetRulePattern}
                  onChange={(e) => setTargetRulePattern(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">目标情景模式 (Target Profile)</label>
                <select
                  value={targetRuleProfileId}
                  onChange={(e) => setTargetRuleProfileId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.profileType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-200 space-y-1">
                <div className="font-semibold">分流路径变更预览:</div>
                <div className="flex items-center gap-1 font-mono">
                  <span>{selectedLog.host}</span>
                  <ArrowRight className="w-3 h-3 text-blue-500" />
                  <span className="font-bold">
                    {profiles.find(p => p.id === targetRuleProfileId)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRuleModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddRule}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
              >
                保存规则并立即应用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
