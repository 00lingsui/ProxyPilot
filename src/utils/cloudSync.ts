import { Profile, WebDavConfig, GitHubGistConfig } from '../types/omega';

export interface CloudSyncResult {
  success: boolean;
  message: string;
  data?: Profile[];
  gistId?: string;
}

/**
 * WebDAV Sync Client (Nutstore / 坚果云, Nextcloud, custom WebDAV)
 */
export async function uploadToWebDav(
  config: WebDavConfig,
  profiles: Profile[],
  activeProfileId: string
): Promise<CloudSyncResult> {
  if (!config.serverUrl) {
    return { success: false, message: '请配置 WebDAV 服务器地址' };
  }

  const payload = JSON.stringify(
    {
      version: '1.0.3',
      exportDate: new Date().toISOString(),
      activeProfileId,
      profiles,
    },
    null,
    2
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.username && config.password) {
    const creds = btoa(`${config.username}:${config.password}`);
    headers['Authorization'] = `Basic ${creds}`;
  }

  try {
    const url = config.serverUrl.endsWith('/')
      ? `${config.serverUrl}proxypilot.json`
      : `${config.serverUrl}/proxypilot.json`;

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: payload,
    });

    if (res.ok || res.status === 201 || res.status === 204) {
      return { success: true, message: '成功同步上传至 WebDAV 云盘！' };
    }
    return { success: false, message: `WebDAV 上传失败 (HTTP ${res.status}): ${res.statusText}` };
  } catch (err: any) {
    return { success: false, message: `WebDAV 网络请求异常: ${err.message || '网络连接超时'}` };
  }
}

export async function downloadFromWebDav(config: WebDavConfig): Promise<CloudSyncResult> {
  if (!config.serverUrl) {
    return { success: false, message: '请配置 WebDAV 服务器地址' };
  }

  const headers: Record<string, string> = {};
  if (config.username && config.password) {
    const creds = btoa(`${config.username}:${config.password}`);
    headers['Authorization'] = `Basic ${creds}`;
  }

  try {
    const url = config.serverUrl.endsWith('/')
      ? `${config.serverUrl}proxypilot.json`
      : `${config.serverUrl}/proxypilot.json`;

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      return { success: false, message: `WebDAV 下载失败 (HTTP ${res.status}): 未找到云端配置文件` };
    }

    const json = await res.json();
    if (json && Array.isArray(json.profiles)) {
      return {
        success: true,
        message: `成功拉取 WebDAV 云端配置 (${json.profiles.length} 个情景模式)`,
        data: json.profiles,
      };
    }
    return { success: false, message: 'WebDAV 云端数据格式不正确' };
  } catch (err: any) {
    return { success: false, message: `WebDAV 下载异常: ${err.message || '网络连接超时'}` };
  }
}

/**
 * GitHub Gist Sync Client
 */
export async function uploadToGitHubGist(
  config: GitHubGistConfig,
  profiles: Profile[],
  activeProfileId: string
): Promise<CloudSyncResult> {
  if (!config.personalAccessToken) {
    return { success: false, message: '请输入 GitHub Personal Access Token (PAT)' };
  }

  const filename = config.filename || 'proxypilot_backup.json';
  const content = JSON.stringify(
    {
      app: 'ProxyPilot',
      version: '1.0.3',
      exportDate: new Date().toISOString(),
      activeProfileId,
      profiles,
    },
    null,
    2
  );

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${config.personalAccessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    if (config.gistId) {
      // Update existing Gist
      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          description: 'ProxyPilot Browser Extension Configuration Backup',
          files: {
            [filename]: { content },
          },
        }),
      });

      if (res.ok) {
        return { success: true, message: `已成功同步至 GitHub Gist (${config.gistId})！` };
      }
      return { success: false, message: `更新 Gist 失败 (HTTP ${res.status})` };
    } else {
      // Create new Gist
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          description: 'ProxyPilot Browser Extension Configuration Backup',
          public: false,
          files: {
            [filename]: { content },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: `成功创建私有 Gist 备份！Gist ID: ${data.id}`,
          gistId: data.id,
        };
      }
      return { success: false, message: `创建 Gist 失败 (HTTP ${res.status})` };
    }
  } catch (err: any) {
    return { success: false, message: `GitHub API 请求失败: ${err.message}` };
  }
}

export async function downloadFromGitHubGist(config: GitHubGistConfig): Promise<CloudSyncResult> {
  if (!config.gistId) {
    return { success: false, message: '请输入已存在的 Gist ID' };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (config.personalAccessToken) {
    headers['Authorization'] = `token ${config.personalAccessToken}`;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      return { success: false, message: `无法获取 Gist (HTTP ${res.status}): 请检查 Gist ID 与权限` };
    }

    const data = await res.json();
    const filename = config.filename || 'proxypilot_backup.json';
    const fileObj = data.files[filename] || Object.values(data.files)[0];

    if (!fileObj || !fileObj.content) {
      return { success: false, message: 'Gist 中未找到有效的 ProxyPilot 配置文件' };
    }

    const parsed = JSON.parse(fileObj.content);
    if (parsed && Array.isArray(parsed.profiles)) {
      return {
        success: true,
        message: `成功拉取 Gist 云端配置 (${parsed.profiles.length} 个情景模式)`,
        data: parsed.profiles,
      };
    }
    return { success: false, message: 'Gist 数据格式不匹配' };
  } catch (err: any) {
    return { success: false, message: `拉取 Gist 异常: ${err.message}` };
  }
}
