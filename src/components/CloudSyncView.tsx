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
  HelpCircle
} from 'lucide-react';
import { Profile, WebDavConfig, GitHubGistConfig, SwitchProfile } from '../types/omega';
import { uploadToWebDav, downloadFromWebDav, uploadToGitHubGist, downloadFromGitHubGist } from '../utils/cloudSync';
import { parseClashRules } from '../utils/clashParser';

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
  const [activeTab, setActiveTab] = useState<'webdav' | 'gist' | 'clash'>('webdav');

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

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              云端同步与规则订阅源扩展 (Cloud Sync & Rules)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              跨多台电脑（Mac/Windows/Linux/Kiwi手机）无缝同步代理配置，并支持一键导入 Clash / Stash 规则 YAML。
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => { setActiveTab('webdav'); setStatusMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'webdav'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
    </div>
  );
};
