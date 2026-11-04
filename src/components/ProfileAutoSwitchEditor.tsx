import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  RefreshCw, 
  Sparkles, 
  Layers,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react';
import { SwitchProfile, Profile, ConditionType, SwitchRule, OnlineRuleList } from '../types/omega';
import { syncRuleList } from '../utils/ruleListSync';

interface ProfileAutoSwitchEditorProps {
  profile: SwitchProfile;
  allProfiles: Profile[];
  onChange: (updated: SwitchProfile) => void;
  onDeleteProfile: (id: string) => void;
  isActive?: boolean;
  onSetActive?: () => void;
  isExtensionContext?: boolean;
  onOpenTakeoverGuidance?: () => void;
}

export const ProfileAutoSwitchEditor: React.FC<ProfileAutoSwitchEditorProps> = ({
  profile,
  allProfiles,
  onChange,
  onDeleteProfile,
  isActive = false,
  onSetActive,
  isExtensionContext = false,
  onOpenTakeoverGuidance,
}) => {
  const [showRuleListEditor, setShowRuleListEditor] = useState(false);
  const [updatingList, setUpdatingList] = useState(false);
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [autoApplyRule, setAutoApplyRule] = useState(true);

  const handleAddRuleList = () => {
    const defaultProxyId = allProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'proxy_clash';
    const newList: OnlineRuleList = {
      id: 'sub_' + Date.now(),
      name: '新规则订阅 ' + ((profile.ruleLists?.length || 0) + 1),
      enabled: true,
      url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
      format: 'AutoProxy',
      profileId: defaultProxyId,
      rulesText: '',
      lastUpdated: '未同步',
    };
    onChange({
      ...profile,
      ruleLists: [...(profile.ruleLists || []), newList],
    });
  };

  const handleUpdateRuleListItem = (idx: number, updated: Partial<OnlineRuleList>) => {
    const list = [...(profile.ruleLists || [])];
    list[idx] = { ...list[idx], ...updated };
    onChange({ ...profile, ruleLists: list });
  };

  const handleDeleteRuleListItem = (idx: number) => {
    const list = [...(profile.ruleLists || [])];
    list.splice(idx, 1);
    onChange({ ...profile, ruleLists: list });
  };

  const handleSyncSingleRuleList = async (idx: number) => {
    const list = [...(profile.ruleLists || [])];
    const target = list[idx];
    if (!target) return;
    try {
      const res = await syncRuleList(target.url);
      target.rulesText = res.text;
      target.lastUpdated = res.lastUpdated;
      onChange({ ...profile, ruleLists: list });
      setSyncFeedback(`✅ 成功同步订阅 "${target.name}" (${res.ruleCount} 条规则)`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e: any) {
      setSyncFeedback(`❌ 订阅同步失败: ${e.message || '网络连接超时'}`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleAddRule = () => {
    const newRule: SwitchRule = {
      id: 'rule_' + Date.now(),
      conditionType: 'HostWildcardCondition',
      pattern: '*.example.com',
      profileId: allProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'direct',
      enabled: true,
      note: '新自定义规则',
    };

    onChange({
      ...profile,
      rules: [newRule, ...profile.rules],
    });
  };

  const handleAddBatchPresets = () => {
    const defaultProxyId = allProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'proxy_clash';
    const presets: Array<{ pattern: string; note: string }> = [
      { pattern: '*.openai.com', note: 'OpenAI / ChatGPT' },
      { pattern: '*.claude.ai', note: 'Anthropic Claude' },
      { pattern: '*.docker.com', note: 'Docker Hub' },
      { pattern: '*.npmjs.org', note: 'NPM 官方源' },
      { pattern: '*.cloudflare.com', note: 'Cloudflare' },
      { pattern: '*.huggingface.co', note: 'Hugging Face' },
    ];

    const newRules: SwitchRule[] = presets
      .filter(preset => !profile.rules.some(r => r.pattern === preset.pattern))
      .map(preset => ({
        id: 'rule_' + Math.random().toString(36).substring(2, 9),
        conditionType: 'HostWildcardCondition',
        pattern: preset.pattern,
        profileId: defaultProxyId,
        enabled: true,
        note: preset.note,
      }));

    if (newRules.length === 0) return;

    onChange({
      ...profile,
      rules: [...newRules, ...profile.rules],
    });
  };

  const handleUpdateRule = (index: number, updatedRule: Partial<SwitchRule>) => {
    const rules = [...profile.rules];
    rules[index] = { ...rules[index], ...updatedRule };
    onChange({ ...profile, rules });
  };

  const handleDeleteRule = (index: number) => {
    const rules = [...profile.rules];
    rules.splice(index, 1);
    onChange({ ...profile, rules });
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= profile.rules.length) return;
    const rules = [...profile.rules];
    const temp = rules[index];
    rules[index] = rules[newIndex];
    rules[newIndex] = temp;
    onChange({ ...profile, rules });
  };

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleUpdateRuleList = async () => {
    setUpdatingList(true);
    setSyncFeedback('⏳ 正在连接规则服务器并同步 GFWList...');
    try {
      const res = await syncRuleList(profile.ruleListConfig?.url);
      const existingConfig = profile.ruleListConfig || {
        enabled: true,
        url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
        format: 'AutoProxy',
        profileId: allProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'proxy_clash',
        defaultProfileId: 'direct',
      };

      onChange({
        ...profile,
        ruleListConfig: {
          ...existingConfig,
          rulesText: res.text,
          lastUpdated: res.lastUpdated,
        },
      });

      setSyncFeedback(`✅ 成功同步 ${res.ruleCount.toLocaleString()} 条规则（来源: ${res.source}，包含 ${res.domainCount.toLocaleString()} 个常用代理域名与 ${res.whitelistCount} 条国内白名单）`);
      setTimeout(() => setSyncFeedback(null), 6000);
    } catch (e: any) {
      setSyncFeedback(`❌ 同步失败: ${e.message || '网络连接超时'}`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setUpdatingList(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Proxy Takeover Status Card */}
      {isActive ? (
        isExtensionContext ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>🟢 浏览器原生底层代理：已真实接管运行</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  智能分流 PAC 引擎正在接管 Chrome 网络请求 | {profile.rules.length} 条已启用规则实时匹配
                </p>
              </div>
            </div>
            <span className="self-end sm:self-center text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              PAC 智能分流中
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>🟡 网页端已激活 (Web 模拟沙箱，尚未接管外部浏览器)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold">
                    WEB SANDBOX
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  受浏览器安全限制，普通网页无权直接篡改系统/浏览器的代理。需加载扩展插件或配置系统 PAC 才能让浏览器真实按规则自动分流！
                </p>
              </div>
            </div>
            {onOpenTakeoverGuidance && (
              <button
                type="button"
                onClick={onOpenTakeoverGuidance}
                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>如何让浏览器真实按规则分流？</span>
              </button>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                ○ 当前未接管浏览器代理
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                自动切换规则已就绪。点击右侧按钮可设为当前情景或查看真实接管方式。
              </p>
            </div>
          </div>
          {onSetActive && (
            <button
              onClick={onSetActive}
              className="self-end sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all transform active:scale-95 shrink-0"
              title="切换至此自动切换模式"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ 设为当前代理并接管</span>
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
              style={{ backgroundColor: profile.color || '#f59e0b' }}
            />
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 rounded transition-colors bg-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            根据请求的网址或域名自动匹配条件，并将网络请求分流至指定的代理或直连通道（按自上而下优先顺序匹配）。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddBatchPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="一键添加 OpenAI / Claude / Docker / NPM 等常用开发者域名规则"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>添加常用预设域名</span>
          </button>

          {!['direct', 'system'].includes(profile.id) && (
            <button
              onClick={() => onDeleteProfile(profile.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
            </button>
          )}
        </div>
      </div>

      {/* Rules List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              分流规则列表 (Switch Rules)
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              · {profile.rules.length} 条已配置规则
            </span>
          </div>

          <button
            onClick={handleAddRule}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加条件</span>
          </button>
        </div>

        {/* Rules Table */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">状态</th>
                  <th className="py-2.5 px-3 w-48">条件类型</th>
                  <th className="py-2.5 px-3 min-w-[200px]">匹配模式 (Pattern)</th>
                  <th className="py-2.5 px-3 w-48">目标情景模式</th>
                  <th className="py-2.5 px-3 min-w-[140px]">备注</th>
                  <th className="py-2.5 px-3 w-24 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {profile.rules.map((rule, idx) => (
                  <tr key={rule.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    {/* Enable toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleUpdateRule(idx, { enabled: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                    </td>

                    {/* Condition Type */}
                    <td className="py-2 px-3">
                      <select
                        value={rule.conditionType}
                        onChange={(e) => handleUpdateRule(idx, { conditionType: e.target.value as ConditionType })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs"
                      >
                        <option value="HostWildcardCondition">域名通配符 (*.domain.com)</option>
                        <option value="UrlWildcardCondition">网址通配符</option>
                        <option value="HostRegexCondition">域名正则</option>
                        <option value="UrlRegexCondition">网址正则</option>
                        <option value="KeywordCondition">关键词</option>
                        <option value="IpCidrCondition">CIDR 网段 (192.168.1.0/24)</option>
                        <option value="PortCondition">端口匹配 (:8443 / :22)</option>
                        <option value="SchemeCondition">协议/类型 (https: / wss:)</option>
                        <option value="ResourceTypeCondition">资源类型 (Image / Media / Script / WS)</option>
                      </select>
                    </td>

                    {/* Pattern */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={rule.pattern}
                        onChange={(e) => handleUpdateRule(idx, { pattern: e.target.value })}
                        className="w-full font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* Target Profile */}
                    <td className="py-2 px-3">
                      <select
                        value={rule.profileId}
                        onChange={(e) => handleUpdateRule(idx, { profileId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden text-xs"
                      >
                        {allProfiles.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Note */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="说明备注"
                        value={rule.note || ''}
                        onChange={(e) => handleUpdateRule(idx, { note: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-400 focus:outline-hidden px-1 py-1 text-slate-500 dark:text-slate-400 text-xs"
                      />
                    </td>

                    {/* Actions: Up, Down, Delete */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveRule(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                          title="上移 (提升优先级)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRule(idx, 'down')}
                          disabled={idx === profile.rules.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                          title="下移 (降低优先级)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="删除规则"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {profile.rules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      暂无自定义规则，点击上方的 "添加条件" 或 "添加常用预设域名" 开始。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Online Rule List (GFWList / AutoProxy) Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              规则列表规则 (Online Rule List / GFWList)
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(profile.ruleListConfig?.enabled)}
              onChange={(e) => {
                const isEnabled = e.target.checked;
                onChange({
                  ...profile,
                  ruleListConfig: {
                    enabled: isEnabled,
                    url: profile.ruleListConfig?.url || 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
                    format: profile.ruleListConfig?.format || 'AutoProxy',
                    profileId: profile.ruleListConfig?.profileId || allProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'proxy_clash',
                    defaultProfileId: profile.ruleListConfig?.defaultProfileId || 'direct',
                    rulesText: profile.ruleListConfig?.rulesText || '||google.com\n||github.com\n||twitter.com',
                    lastUpdated: profile.ruleListConfig?.lastUpdated || new Date().toISOString().slice(0, 10),
                  },
                });
              }}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>启用在线规则列表</span>
          </label>
        </div>

        {profile.ruleListConfig?.enabled && (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* URL */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  规则列表 URL (Rule List URL)
                </label>
                <input
                  type="text"
                  value={profile.ruleListConfig.url}
                  onChange={(e) => {
                    if (profile.ruleListConfig) {
                      onChange({
                        ...profile,
                        ruleListConfig: { ...profile.ruleListConfig, url: e.target.value },
                      });
                    }
                  }}
                  className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden"
                />
              </div>

              {/* Format */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  规则列表格式
                </label>
                <select
                  value={profile.ruleListConfig.format}
                  onChange={(e) => {
                    if (profile.ruleListConfig) {
                      onChange({
                        ...profile,
                        ruleListConfig: { ...profile.ruleListConfig, format: e.target.value as 'AutoProxy' | 'Switchy' },
                      });
                    }
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="AutoProxy">AutoProxy (GFWList 格式)</option>
                  <option value="Switchy">Switchy 格式</option>
                </select>
              </div>

              {/* Target Profile for Rule List */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  命中列表时走的情景模式
                </label>
                <select
                  value={profile.ruleListConfig.profileId}
                  onChange={(e) => {
                    if (profile.ruleListConfig) {
                      onChange({
                        ...profile,
                        ruleListConfig: { ...profile.ruleListConfig, profileId: e.target.value },
                      });
                    }
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden font-medium"
                >
                  {allProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {syncFeedback && (
              <div className="py-1.5 px-3 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                {syncFeedback}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                最后更新时间: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{profile.ruleListConfig.lastUpdated || '未更新'}</span>
                <span className="ml-2 text-slate-400 dark:text-slate-500">
                  (已缓存 {profile.ruleListConfig.rulesText ? profile.ruleListConfig.rulesText.split('\n').filter(l => l.trim() && !l.trim().startsWith('!')).length.toLocaleString() : 0} 条规则)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRuleListEditor(!showRuleListEditor)}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showRuleListEditor ? '折叠规则文本' : '查看/编辑本地缓存规则'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpdateRuleList}
                  disabled={updatingList}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingList ? 'animate-spin' : ''}`} />
                  <span>{updatingList ? '正在下载同步中...' : '立即同步更新'}</span>
                </button>
              </div>
            </div>

            {showRuleListEditor && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    本地规则列表文本 (支持 ||domain 匹配以及 @@ 白名单直接连接)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {profile.ruleListConfig.rulesText ? profile.ruleListConfig.rulesText.split('\n').length.toLocaleString() : 0} 行
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={profile.ruleListConfig.rulesText || ''}
                  onChange={(e) => {
                    if (profile.ruleListConfig) {
                      onChange({
                        ...profile,
                        ruleListConfig: { ...profile.ruleListConfig, rulesText: e.target.value },
                      });
                    }
                  }}
                  className="w-full font-mono text-xs bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-emerald-300 p-3 rounded-md focus:outline-hidden"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multi-Rule Lists (Multiple Subscriptions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              多规则库订阅 (Multiple Online Rule Lists)
            </h3>
            <span className="text-[11px] text-slate-500">
              ({profile.ruleLists?.length || 0} 个自定义规则库)
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddRuleList}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加规则订阅</span>
          </button>
        </div>

        {profile.ruleLists && profile.ruleLists.length > 0 && (
          <div className="space-y-2">
            {profile.ruleLists.map((rList, rIdx) => (
              <div key={rList.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={rList.enabled}
                    onChange={(e) => handleUpdateRuleListItem(rIdx, { enabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rList.name}
                        onChange={(e) => handleUpdateRuleListItem(rIdx, { name: e.target.value })}
                        className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden"
                      />
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {rList.format}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={rList.url}
                      onChange={(e) => handleUpdateRuleListItem(rIdx, { url: e.target.value })}
                      className="text-xs font-mono text-slate-500 dark:text-slate-400 w-full truncate bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={rList.profileId}
                    onChange={(e) => handleUpdateRuleListItem(rIdx, { profileId: e.target.value })}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200"
                  >
                    {allProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSyncSingleRuleList(rIdx)}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 px-2 py-1 rounded"
                    title="立即同步此规则库"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">同步</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRuleListItem(rIdx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="删除订阅"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Learn / Smart Routing Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              智能分流与“自动学习”模式 (Auto-Learn / Smart Routing)
            </h3>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full">
              无感自愈
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoLearnEnabled}
              onChange={(e) => setAutoLearnEnabled(e.target.checked)}
              className="rounded text-amber-600 focus:ring-0"
            />
            <span>开启智能自动学习</span>
          </label>
        </div>

        {autoLearnEnabled && (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-2xs">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              当您在直连或系统代理模式下，访问某个网页遇到连接超时、连接被重置 (ERR_CONNECTION_RESET) 或 504 错误时，ProxyPilot 会自动检测并将该域名智能纳入自动切换代理规则中，实现真正的无感智能路由。
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="autoLearnAction"
                  checked={autoApplyRule}
                  onChange={() => setAutoApplyRule(true)}
                  className="text-amber-600"
                />
                <span>静默无感自动生效（推荐）</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="autoLearnAction"
                  checked={!autoApplyRule}
                  onChange={() => setAutoApplyRule(false)}
                  className="text-amber-600"
                />
                <span>在弹窗与通知中提示我确认</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Default Fallback Profile Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            默认情景模式 (Default Fallback Profile)
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">当上述规则均未命中时所采用的情景模式</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              通常推荐设为 "直接连接 (Direct)"，仅当访问外网或规则库中域名时才走代理。
            </p>
          </div>

          <select
            value={profile.defaultProfileId}
            onChange={(e) => onChange({ ...profile, defaultProfileId: e.target.value })}
            className="sm:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {allProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.profileType})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
