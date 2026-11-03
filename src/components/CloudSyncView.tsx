import React, { useState } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  FileCode, 
  Check, 
  AlertCircle, 
  Key, 
  Server, 
  RefreshCw,
  FolderSync,
  HelpCircle,
  Globe,
  Zap,
  ShieldCheck,
  Code2,
  Copy,
  Download,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Profile, WebDavConfig, GitHubGistConfig, SwitchProfile, PacProfile, SwitchRule } from '../types/omega';
import { uploadToWebDav, downloadFromWebDav, uploadToGitHubGist, downloadFromGitHubGist } from '../utils/cloudSync';
import { parseClashRules } from '../utils/clashParser';
import { syncRuleList, parseAutoProxyText, RULE_LIST_MIRRORS } from '../utils/ruleListSync';
import { compileGfwlistToPac, compileCuratedGfwlistPac, GFWLIST_MIRRORS } from '../utils/gfwlistPacCompiler';

interface CloudSyncViewProps {
  profiles: Profile[];
  activeProfileId: string;
  onImportProfiles: (profiles: Profile[]) => void;
  onUpdateProfiles: (updated: Profile[]) => void;
}

const DEFAULT_WEBDAV_CONFIG: WebDavConfig = {
  enabled: true,
  serverUrl: 'https://dav.jianguoyun.com/dav/',
  username: '',
  password: '',
  remotePath: '/proxypilot.json',
  autoSync: false,
};

const DEFAULT_GIST_CONFIG: GitHubGistConfig = {
  enabled: true,
  personalAccessToken: '',
  gistId: '',
  filename: 'proxypilot_backup.json',
  autoSync: false,
};

export const CloudSyncView: React.FC<CloudSyncViewProps> = ({
  profiles,
  activeProfileId,
  onImportProfiles,
  onUpdateProfiles,
}) => {
  const [activeTab, setActiveTab] = useState<'webdav' | 'gist' | 'clash' | 'gfwlist'>('gfwlist');

  // WebDAV state
  const [webdavConfig, setWebdavConfig] = useState<WebDavConfig>(() => {
    try {
      const saved = localStorage.getItem('proxypilot_webdav_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WEBDAV_CONFIG;
  });

  // Gist state
  const [gistConfig, setGistConfig] = useState<GitHubGistConfig>(() => {
    try {
      const saved = localStorage.getItem('proxypilot_gist_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_GIST_CONFIG;
  });

  // Clash import state
  const [clashYamlInput, setClashYamlInput] = useState<string>(`# 示例 Clash 规则段 (直接粘贴您的 Clash 配置即可转换)
rules:
  - DOMAIN-SUFFIX,google.com,Proxy
  - DOMAIN-SUFFIX,github.com,Proxy
  - DOMAIN-KEYWORD,youtube,Proxy
  - IP-CIDR,192.168.1.0/24,DIRECT
  - IP-CIDR,10.0.0.0/8,DIRECT
  - DST-PORT,8443,Proxy
  - MATCH,DIRECT`);
  const [clashTargetProfileId, setClashTargetProfileId] = useState<string>('proxy_clash');

  // GFWList remote fetch & PAC conversion state
  const [gfwlistRemoteUrl, setGfwlistRemoteUrl] = useState<string>(RULE_LIST_MIRRORS[0]);
  const [gfwlistProxyStatement, setGfwlistProxyStatement] = useState<string>('SOCKS5 127.0.0.1:7897; DIRECT');
  const [gfwlistStorageTarget, setGfwlistStorageTarget] = useState<'both' | 'pac' | 'switch' | 'new_profile'>('both');
  const [gfwlistRuleLimit, setGfwlistRuleLimit] = useState<number>(50); // limit of switch rules to insert into SwitchProfile rules table
  const [isGfwlistSyncing, setIsGfwlistSyncing] = useState<boolean>(false);
  const [gfwlistResult, setGfwlistResult] = useState<{
    success: boolean;
    source: string;
    domainCount: number;
    whitelistCount: number;
    pacScript: string;
    targetSummary: string;
    previewDomains: string[];
  } | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [pacCopied, setPacCopied] = useState<boolean>(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveWebDavConfig = (cfg: WebDavConfig) => {
    setWebdavConfig(cfg);
    try {
      localStorage.setItem('proxypilot_webdav_v1', JSON.stringify(cfg));
    } catch {}
  };

  const saveGistConfig = (cfg: GitHubGistConfig) => {
    setGistConfig(cfg);
    try {
      localStorage.setItem('proxypilot_gist_v1', JSON.stringify(cfg));
    } catch {}
  };

  const handleWebDavUpload = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await uploadToWebDav(webdavConfig, profiles, activeProfileId);
    setIsLoading(false);
    if (res.success) {
      const updated = { ...webdavConfig, lastSyncTime: new Date().toLocaleTimeString() };
      saveWebDavConfig(updated);
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleWebDavDownload = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await downloadFromWebDav(webdavConfig);
    setIsLoading(false);
    if (res.success && res.data) {
      onImportProfiles(res.data);
      const updated = { ...webdavConfig, lastSyncTime: new Date().toLocaleTimeString() };
      saveWebDavConfig(updated);
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleGistUpload = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await uploadToGitHubGist(gistConfig, profiles, activeProfileId);
    setIsLoading(false);
    if (res.success) {
      const updated = { 
        ...gistConfig, 
        gistId: res.gistId || gistConfig.gistId,
        lastSyncTime: new Date().toLocaleTimeString() 
      };
      saveGistConfig(updated);
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleGistDownload = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await downloadFromGitHubGist(gistConfig);
    setIsLoading(false);
    if (res.success && res.data) {
      onImportProfiles(res.data);
      const updated = { ...gistConfig, lastSyncTime: new Date().toLocaleTimeString() };
      saveGistConfig(updated);
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleConvertClashRules = () => {
    if (!clashYamlInput.trim()) {
      setStatusMsg({ type: 'error', text: '请输入或粘贴 Clash 规则内容' });
      return;
    }

    const result = parseClashRules(clashYamlInput, profiles, clashTargetProfileId);
    if (result.rules.length === 0) {
      setStatusMsg({ type: 'error', text: '未能解析到有效规则，请确认包含 DOMAIN-SUFFIX, IP-CIDR 等格式' });
      return;
    }

    // Merge into first available SwitchProfile
    const switchProfile = profiles.find(p => p.profileType === 'SwitchProfile') as SwitchProfile | undefined;
    if (!switchProfile) {
      setStatusMsg({ type: 'error', text: '当前未找到自动切换 (AutoSwitch) 情景模式，请先创建' });
      return;
    }

    const updatedSwitchProfile: SwitchProfile = {
      ...switchProfile,
      rules: [...result.rules, ...switchProfile.rules],
    };

    const updatedProfiles = profiles.map(p => p.id === switchProfile.id ? updatedSwitchProfile : p);
    onUpdateProfiles(updatedProfiles);
    setStatusMsg({
      type: 'success',
      text: `成功将 ${result.rules.length} 条 Clash 分流规则导入并合并到 [${switchProfile.name}]！(已包含 CIDR/端口/域名转换)`,
    });
  };

  // Core handler: Fetch GFWList from remote URL and convert into PAC routing rules stored in local profile configuration
  const handleFetchAndConvertGfwlist = async (useCurated = false) => {
    try {
      setIsGfwlistSyncing(true);
      setStatusMsg(null);
      let rawText = '';
      let sourceLabel = '';
      let timeStr = new Date().toLocaleTimeString();

      if (useCurated) {
        rawText = ''; // will trigger curated
        sourceLabel = 'ProxyPilot 精选高频 GFWList 核心离线库';
      } else {
        const syncRes = await syncRuleList(gfwlistRemoteUrl);
        rawText = syncRes.text;
        sourceLabel = syncRes.source;
        timeStr = syncRes.lastUpdated;
      }

      // Compile to pure-ASCII PAC script
      const pacResult = compileGfwlistToPac({
        proxyStatement: gfwlistProxyStatement.trim() || 'SOCKS5 127.0.0.1:7897; DIRECT',
        fallbackStatement: 'DIRECT',
        rulesText: rawText,
        sourceUrl: sourceLabel,
      });

      // Parse structured domains for switch rules conversion
      const parsed = parseAutoProxyText(rawText);
      const topDomains = parsed.proxyDomains.slice(0, gfwlistRuleLimit);

      // Convert domains into SwitchRules
      const convertedSwitchRules: SwitchRule[] = topDomains.map((dom, idx) => ({
        id: `gfw_${Date.now()}_${idx}`,
        conditionType: 'HostWildcardCondition',
        pattern: `*.${dom}`,
        profileId: clashTargetProfileId,
        enabled: true,
        note: `GFWList 规则 (${dom})`,
      }));

      let updatedProfiles = [...profiles];
      const targetSummaries: string[] = [];

      // 1. If target includes 'pac' or 'both'
      if (gfwlistStorageTarget === 'pac' || gfwlistStorageTarget === 'both') {
        const pacProfIdx = updatedProfiles.findIndex(p => p.profileType === 'PacProfile');
        if (pacProfIdx !== -1) {
          const pacProf = updatedProfiles[pacProfIdx] as PacProfile;
          updatedProfiles[pacProfIdx] = {
            ...pacProf,
            pacScript: pacResult.pacScript,
            pacUrl: useCurated ? '' : gfwlistRemoteUrl,
          };
          targetSummaries.push(`情景模式 [${pacProf.name}] (PAC 智能脚本)`);
        } else {
          // Create new PacProfile
          const newPac: PacProfile = {
            id: `pac_gfwlist_${Date.now()}`,
            name: 'GFWList 智能 PAC',
            profileType: 'PacProfile',
            color: '#ec4899',
            pacScript: pacResult.pacScript,
            pacUrl: useCurated ? '' : gfwlistRemoteUrl,
          };
          updatedProfiles.push(newPac);
          targetSummaries.push(`新建情景模式 [${newPac.name}]`);
        }
      }

      // 2. If target includes 'switch' or 'both'
      if (gfwlistStorageTarget === 'switch' || gfwlistStorageTarget === 'both') {
        const swProfIdx = updatedProfiles.findIndex(p => p.profileType === 'SwitchProfile');
        if (swProfIdx !== -1) {
          const swProf = updatedProfiles[swProfIdx] as SwitchProfile;
          // Deduplicate converted rules
          const existingPatterns = new Set(swProf.rules.map(r => r.pattern));
          const newUniqueRules = convertedSwitchRules.filter(r => !existingPatterns.has(r.pattern));

          updatedProfiles[swProfIdx] = {
            ...swProf,
            ruleListConfig: {
              enabled: true,
              url: useCurated ? (swProf.ruleListConfig?.url || '') : gfwlistRemoteUrl,
              format: 'AutoProxy',
              profileId: clashTargetProfileId,
              defaultProfileId: swProf.defaultProfileId || 'direct',
              rulesText: rawText || swProf.ruleListConfig?.rulesText,
              lastUpdated: timeStr,
            },
            rules: [...newUniqueRules, ...swProf.rules],
          };
          targetSummaries.push(`情景模式 [${swProf.name}] (注入 ${newUniqueRules.length} 条通配符规则并持久化缓存)`);
        }
      }

      // 3. If target is 'new_profile'
      if (gfwlistStorageTarget === 'new_profile') {
        const newPac: PacProfile = {
          id: `pac_custom_${Date.now()}`,
          name: `GFWList 订阅 PAC (${new Date().toLocaleDateString()})`,
          profileType: 'PacProfile',
          color: '#06b6d4',
          pacScript: pacResult.pacScript,
          pacUrl: useCurated ? '' : gfwlistRemoteUrl,
        };
        updatedProfiles.push(newPac);
        targetSummaries.push(`新建独立情景模式 [${newPac.name}]`);
      }

      // Commit to local storage and extension
      onUpdateProfiles(updatedProfiles);

      setGfwlistResult({
        success: true,
        source: sourceLabel,
        domainCount: pacResult.proxyCount,
        whitelistCount: pacResult.whitelistCount,
        pacScript: pacResult.pacScript,
        targetSummary: targetSummaries.join(' 与 '),
        previewDomains: parsed.proxyDomains.slice(0, 300),
      });

      setStatusMsg({
        type: 'success',
        text: `✅ 成功从远程源获取 GFWList 并完成 PAC 分流转换！已自动存储至本地 ${targetSummaries.join(' 与 ')}，包含 ${pacResult.proxyCount.toLocaleString()} 个被墙域名哈希表及 ${pacResult.whitelistCount} 条直连白名单。`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `获取或转换失败: ${err.message || '网络连接超时'}。建议尝试切换镜像源或载入内置离线库。`,
      });
    } finally {
      setIsGfwlistSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>云端同步与规则订阅源扩展 (Cloud Sync & Rules)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold">
                GFWList ➔ PAC 转换器
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              从远程 URL 获取最新权威 GFWList 规则列表并自动编译为 PAC 分流脚本，支持 WebDAV、GitHub Gist 以及 Clash 规则段转换。
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => { setActiveTab('gfwlist'); setStatusMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'gfwlist'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ GFWList 远程同步转 PAC 分流</span>
          </button>

          <button
            onClick={() => { setActiveTab('webdav'); setStatusMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'webdav'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>WebDAV 同步 (坚果云 / Nextcloud)</span>
          </button>

          <button
            onClick={() => { setActiveTab('gist'); setStatusMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'gist'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>GitHub Gist 秘钥同步</span>
          </button>

          <button
            onClick={() => { setActiveTab('clash'); setStatusMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'clash'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Clash / Stash 规则导入</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
        }`}>
          {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tab 1: WebDAV */}
      {activeTab === 'webdav' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-blue-600" />
              WebDAV 服务器凭据配置
            </h3>
            {webdavConfig.lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                最近同步时间: {webdavConfig.lastSyncTime}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                WebDAV 服务器 URL (例如 坚果云: https://dav.jianguoyun.com/dav/)
              </label>
              <input
                type="text"
                value={webdavConfig.serverUrl}
                onChange={(e) => saveWebDavConfig({ ...webdavConfig, serverUrl: e.target.value })}
                placeholder="https://dav.jianguoyun.com/dav/"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">账号 / 邮箱 (Username)</label>
              <input
                type="text"
                value={webdavConfig.username || ''}
                onChange={(e) => saveWebDavConfig({ ...webdavConfig, username: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">密码 / 应用独立授权码 (Password / App Token)</label>
              <input
                type="password"
                value={webdavConfig.password || ''}
                onChange={(e) => saveWebDavConfig({ ...webdavConfig, password: e.target.value })}
                placeholder="坚果云需在官网生成应用专用授权码"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              坚果云用户请前往「个人信息 ➔ 安全选项 ➔ 添加应用密码」获取专用授权码。
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWebDavDownload}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>从 WebDAV 拉取并覆盖</span>
              </button>

              <button
                onClick={handleWebDavUpload}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>立即同步上传配置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GitHub Gist */}
      {activeTab === 'gist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              GitHub Gist 私有云备份
            </h3>
            {gistConfig.lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                最近同步时间: {gistConfig.lastSyncTime}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                GitHub Personal Access Token (需勾选 gist 权限)
              </label>
              <input
                type="password"
                value={gistConfig.personalAccessToken || ''}
                onChange={(e) => saveGistConfig({ ...gistConfig, personalAccessToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Gist ID (留空则在首次同步时自动创建)
              </label>
              <input
                type="text"
                value={gistConfig.gistId || ''}
                onChange={(e) => saveGistConfig({ ...gistConfig, gistId: e.target.value })}
                placeholder="例如: 8a7c1b4e9f2d..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              采用 Secret Gist 存储，仅持有 Token 的授权客户端可读写。
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGistDownload}
                disabled={isLoading || !gistConfig.gistId}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>从 Gist 拉取并应用</span>
              </button>

              <button
                onClick={handleGistUpload}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>同步至 Gist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Clash / Stash YAML Rule Converter */}
      {activeTab === 'clash' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-500" />
                Clash / Stash 规则 YAML 转换器
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                自动将 Clash 规则段（DOMAIN-SUFFIX、DOMAIN-KEYWORD、IP-CIDR、DST-PORT）解构转换为 ProxyPilot 分流规则。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">解析后代理走向:</span>
              <select
                value={clashTargetProfileId}
                onChange={(e) => setClashTargetProfileId(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <textarea
              rows={8}
              value={clashYamlInput}
              onChange={(e) => setClashYamlInput(e.target.value)}
              className="w-full px-3 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              placeholder="在此粘贴 Clash 规则段 (rules: 或 payload:)..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              支持 DOMAIN-SUFFIX ➔ 通配符, IP-CIDR ➔ isInNet 网段, DST-PORT ➔ 端口过滤
            </span>

            <button
              onClick={handleConvertClashRules}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>解析并合并到自动切换规则</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: GFWList Remote Fetch & PAC Conversion */}
      {activeTab === 'gfwlist' && (
        <div className="bg-white dark:bg-slate-900 border border-pink-200/70 dark:border-pink-900/40 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-500" />
                从远程 URL 获取 GFWList 并自动转换为 PAC 分流规则
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                实时从 GitHub、CDN 或自定义订阅源拉取最新 GFWList 规则列表，自动解码并转换为标准 PAC 脚本与通配符规则，持久化保存至本地情景模式中。
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-mono font-medium border border-pink-200 dark:border-pink-900/50">
                100% Pure ASCII · O(1) Hash Map
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Remote GFWList URL */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                远程 GFWList 订阅 URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gfwlistRemoteUrl}
                  onChange={(e) => setGfwlistRemoteUrl(e.target.value)}
                  placeholder="https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Quick Mirror Selector Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center">快速源:</span>
                {GFWLIST_MIRRORS.map(m => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => setGfwlistRemoteUrl(m.url)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                      gfwlistRemoteUrl === m.url
                        ? 'bg-pink-600 text-white font-medium shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Proxy Statement */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                PAC 命中代理时的返回值 (Proxy Statement):
              </label>
              <input
                type="text"
                value={gfwlistProxyStatement}
                onChange={(e) => setGfwlistProxyStatement(e.target.value)}
                placeholder="SOCKS5 127.0.0.1:7897; DIRECT"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center">常用预设:</span>
                {[
                  { label: 'Clash SOCKS5 7897', val: 'SOCKS5 127.0.0.1:7897; DIRECT' },
                  { label: 'Clash HTTP 7897', val: 'PROXY 127.0.0.1:7897; DIRECT' },
                  { label: 'v2rayN 10808', val: 'SOCKS5 127.0.0.1:10808; DIRECT' },
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setGfwlistProxyStatement(p.val)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Storage Destination */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                本地存储目标 (自动持久化到此情景模式):
              </label>
              <select
                value={gfwlistStorageTarget}
                onChange={(e) => setGfwlistStorageTarget(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="both">⚡ 双重同步：同时更新「PAC 智能脚本」与「自动切换」模式 (推荐)</option>
                <option value="pac">📜 仅存储至「PAC 智能脚本」情景模式 (写入纯 ASCII PAC 脚本)</option>
                <option value="switch">🔀 仅存储至「自动切换」情景模式 (注入分流规则与规则列表缓存)</option>
                <option value="new_profile">✨ 新建独立的「GFWList 订阅 PAC」专用情景模式</option>
              </select>
              <p className="text-[11px] text-slate-400">
                转换结果将自动写入浏览器本地存储与 Chromium 代理引擎，重启浏览器依然保留。
              </p>
            </div>

            {/* 4. Associate Proxy Node & Limit */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                关联分流目标情景节点:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={clashTargetProfileId}
                  onChange={(e) => setClashTargetProfileId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.profileType})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-[11px] text-slate-500 shrink-0">转换规则数:</span>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={gfwlistRuleLimit}
                    onChange={(e) => setGfwlistRuleLimit(Math.max(10, Math.min(500, parseInt(e.target.value, 10) || 50)))}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 font-mono text-center focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">条</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                PAC 模式将包含全部 4,400+ 域名；自动切换列表将优先载入前 {gfwlistRuleLimit} 条核心域名通配符。
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              自动处理 AutoProxy Base64 解码、白名单过滤及局域网直连绕过
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFetchAndConvertGfwlist(true)}
                disabled={isGfwlistSyncing}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
              >
                📋 载入精选 4,400+ 核心离线库并存储
              </button>

              <button
                type="button"
                onClick={() => handleFetchAndConvertGfwlist(false)}
                disabled={isGfwlistSyncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGfwlistSyncing ? 'animate-spin' : ''}`} />
                <span>{isGfwlistSyncing ? '正在从远程获取并转换...' : '⚡ 立即从远程获取并转换为 PAC 分流配置'}</span>
              </button>
            </div>
          </div>

          {/* Conversion Details & Result Inspector */}
          {gfwlistResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    转换成功并已持久化存储
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {gfwlistResult.targetSummary}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gfwlistResult.pacScript);
                      setPacCopied(true);
                      setTimeout(() => setPacCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {pacCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{pacCopied ? '已复制 PAC' : '复制 PAC 脚本'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const blob = new Blob([gfwlistResult.pacScript], { type: 'application/x-ns-proxy-autoconfig' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'gfwlist_smart.pac';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-pink-600 hover:bg-pink-700 text-white rounded-md shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 proxy.pac</span>
                  </button>
                </div>
              </div>

              {/* Conversion Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">远程规则来源</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={gfwlistResult.source}>
                    {gfwlistResult.source}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">已转换代理域名</div>
                  <div className="font-bold text-pink-600 dark:text-pink-400 text-sm mt-0.5">
                    {gfwlistResult.domainCount.toLocaleString()} 条
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">直连白名单</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                    {gfwlistResult.whitelistCount} 条
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">PAC 查表算法</div>
                  <div className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    O(1) 后缀树字典表
                  </div>
                </div>
              </div>

              {/* Searchable Domains Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    解析提取的被墙域名清单预览 ({gfwlistResult.previewDomains.length} 个):
                  </span>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      placeholder="快速过滤域名..."
                      className="w-full pl-7 pr-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  {gfwlistResult.previewDomains
                    .filter(d => !domainFilter || d.includes(domainFilter.toLowerCase()))
                    .slice(0, 100)
                    .map(d => (
                      <span key={d} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        *.{d}
                      </span>
                    ))}
                  {gfwlistResult.previewDomains.length > 100 && (
                    <span className="px-2 py-0.5 rounded text-slate-400 self-center">
                      ... 其余 {(gfwlistResult.previewDomains.length - 100).toLocaleString()} 个域名已封装于 PAC 字典表中
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible PAC Code Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-pink-500" />
                    生成的 PAC 脚本代码 (已写入本地情景模式):
                  </span>
                  <span className="font-mono text-[11px]">
                    {gfwlistResult.pacScript.split('\n').length.toLocaleString()} lines · Pure ASCII
                  </span>
                </div>
                <pre className="max-h-48 overflow-y-auto p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-pink-300 leading-relaxed border border-slate-800">
                  <code>{gfwlistResult.pacScript}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
