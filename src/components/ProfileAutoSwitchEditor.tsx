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
  HelpCircle
} from 'lucide-react';
import { SwitchProfile, Profile, ConditionType, SwitchRule } from '../types/omega';

interface ProfileAutoSwitchEditorProps {
  profile: SwitchProfile;
  allProfiles: Profile[];
  onChange: (updated: SwitchProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileAutoSwitchEditor: React.FC<ProfileAutoSwitchEditorProps> = ({
  profile,
  allProfiles,
  onChange,
  onDeleteProfile,
}) => {
  const [showRuleListEditor, setShowRuleListEditor] = useState(false);
  const [updatingList, setUpdatingList] = useState(false);

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

  const handleSimulateUpdateRuleList = () => {
    setUpdatingList(true);
    setTimeout(() => {
      setUpdatingList(false);
      if (profile.ruleListConfig) {
        onChange({
          ...profile,
          ruleListConfig: {
            ...profile.ruleListConfig,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
          },
        });
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
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
                        <option value="HostWildcardCondition">域名通配符</option>
                        <option value="UrlWildcardCondition">网址通配符</option>
                        <option value="HostRegexCondition">域名正则</option>
                        <option value="UrlRegexCondition">网址正则</option>
                        <option value="KeywordCondition">关键词</option>
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                最后更新时间: <span className="font-mono text-slate-700 dark:text-slate-300">{profile.ruleListConfig.lastUpdated || '未更新'}</span>
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
                  onClick={handleSimulateUpdateRuleList}
                  disabled={updatingList}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded font-medium transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${updatingList ? 'animate-spin' : ''}`} />
                  <span>{updatingList ? '正在更新同步...' : '立即同步更新'}</span>
                </button>
              </div>
            </div>

            {showRuleListEditor && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  本地规则列表文本 (支持 ||domain 匹配以及 @@ 白名单直接连接)
                </label>
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
