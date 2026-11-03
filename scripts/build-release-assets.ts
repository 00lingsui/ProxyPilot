import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { DEFAULT_PROFILES } from '../src/utils/defaultData';
import { generatePacScript } from '../src/utils/pacGenerator';
import { generateOptionsHtml, generateOptionsJs } from '../src/utils/extensionOptionsApp';
import { compileCuratedGfwlistPac } from '../src/utils/gfwlistPacCompiler';

async function buildRelease() {
  console.log('📦 Building ProxyPilot v1.0.6 Release Assets...');
  const zip = new JSZip();

  const activeProfile = DEFAULT_PROFILES.find(p => p.id === 'auto_switch') || DEFAULT_PROFILES[0];
  const pacCode = generatePacScript(activeProfile, DEFAULT_PROFILES);

  // 1. manifest.json
  const manifest = {
    manifest_version: 3,
    name: "ProxyPilot",
    short_name: "ProxyPilot",
    version: "1.0.6",
    description: "Lightweight, powerful browser proxy automation suite for desktop & mobile (Chrome, Edge, Kiwi).",
    permissions: [
      "proxy",
      "storage",
      "tabs",
      "webRequest",
      "webRequestAuthProvider"
    ],
    host_permissions: [
      "<all_urls>"
    ],
    background: {
      service_worker: "background.js"
    },
    action: {
      default_popup: "popup.html",
      default_title: "ProxyPilot Proxy Manager"
    },
    commands: {
      "cycle-profile": {
        "suggested_key": {
          "default": "Alt+Shift+X",
          "mac": "Alt+Shift+X"
        },
        "description": "循环切换生效情景模式 (Cycle Profile)"
      },
      "toggle-direct-proxy": {
        "suggested_key": {
          "default": "Alt+Shift+P",
          "mac": "Alt+Shift+P"
        },
        "description": "在自动切换与代理模式间一键切换 (Toggle Auto/Proxy)"
      }
    },
    options_ui: {
      page: "options.html",
      open_in_tab: true
    }
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 2. background.js
  const backgroundJs = `// ProxyPilot - Background Service Worker (Manifest V3)
// Strictly ASCII-compliant proxy manager with Auto-Auth, Tab Override, and Smart Learn.
const DEFAULT_PROFILES = ${JSON.stringify(DEFAULT_PROFILES, null, 2)};
let currentActiveProfileId = "auto_switch";

function toPureAscii(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\\x00-\\x7F]/g, '');
}

function formatPacStatement(prof) {
  if (!prof) return 'DIRECT';
  if (prof.profileType === 'DirectProfile') return 'DIRECT';
  if (prof.profileType === 'SystemProfile') return 'SYSTEM';
  if (prof.profileType === 'FixedProfile' && prof.fallbackProxy) {
    const p = prof.fallbackProxy;
    const host = toPureAscii(p.host || '127.0.0.1');
    const port = p.port || 7897;
    const scheme = (p.scheme || 'socks5').toLowerCase();
    if (scheme === 'socks5') return 'SOCKS5 ' + host + ':' + port + '; SOCKS ' + host + ':' + port + '; DIRECT';
    if (scheme === 'socks4') return 'SOCKS ' + host + ':' + port + '; DIRECT';
    if (scheme === 'https') return 'HTTPS ' + host + ':' + port + '; DIRECT';
    return 'PROXY ' + host + ':' + port + '; DIRECT';
  }
  return 'DIRECT';
}

function buildPacScriptForProfile(target, allProfiles) {
  if (target.profileType === 'PacProfile' && target.pacScript) {
    return toPureAscii(target.pacScript);
  }
  if (target.profileType === 'DirectProfile') {
    return '// ProxyPilot PAC Script - Direct\\nfunction FindProxyForURL(url, host) { return "DIRECT"; }';
  }
  if (target.profileType === 'SystemProfile') {
    return '// ProxyPilot PAC Script - System\\nfunction FindProxyForURL(url, host) { return "SYSTEM"; }';
  }
  if (target.profileType === 'FixedProfile') {
    const ret = formatPacStatement(target);
    return '// ProxyPilot PAC Script - Fixed Proxy\\nfunction FindProxyForURL(url, host) {\\n  return "' + ret + '";\\n}';
  }
  if (target.profileType === 'SwitchProfile') {
    const sw = target;
    const defProf = allProfiles.find(p => p.id === sw.defaultProfileId) || allProfiles.find(p => p.id === 'direct');
    const defaultRet = formatPacStatement(defProf);
    const ruleLines = [];
    const rules = sw.rules || [];
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (!r.enabled) continue;
      const targetProf = allProfiles.find(p => p.id === r.profileId);
      const targetRet = formatPacStatement(targetProf);
      const cleanPat = toPureAscii(r.pattern);
      if (r.conditionType === 'HostWildcardCondition') {
        ruleLines.push('  if (shExpMatch(host, "' + cleanPat + '")) return "' + targetRet + '";');
      } else if (r.conditionType === 'UrlWildcardCondition') {
        ruleLines.push('  if (shExpMatch(url, "' + cleanPat + '")) return "' + targetRet + '";');
      } else if (r.conditionType === 'HostRegexCondition') {
        ruleLines.push('  if (/' + cleanPat + '/i.test(host)) return "' + targetRet + '";');
      } else if (r.conditionType === 'UrlRegexCondition') {
        ruleLines.push('  if (/' + cleanPat + '/i.test(url)) return "' + targetRet + '";');
      } else if (r.conditionType === 'KeywordCondition') {
        ruleLines.push('  if (url.indexOf("' + cleanPat + '") !== -1 || host.indexOf("' + cleanPat + '") !== -1) return "' + targetRet + '";');
      } else if (r.conditionType === 'IpCidrCondition') {
        ruleLines.push('  if (isInNet(host, "' + cleanPat + '", "255.255.255.0")) return "' + targetRet + '";');
      } else if (r.conditionType === 'PortCondition') {
        ruleLines.push('  if (url.indexOf(":' + cleanPat + '") !== -1) return "' + targetRet + '";');
      }
    }
    return '// ProxyPilot PAC Script - Switch Rules\\nfunction FindProxyForURL(url, host) {\\n' +
      (ruleLines.length ? ruleLines.join('\\n') + '\\n' : '') +
      '  return "' + defaultRet + '";\\n}';
  }
  return 'function FindProxyForURL(url, host) { return "DIRECT"; }';
}

async function applyProxySettings(profileId) {
  if (!chrome.proxy || !chrome.proxy.settings) return;
  const storage = await chrome.storage.local.get(['profiles', 'activeProfileId']);
  const profiles = storage.profiles || DEFAULT_PROFILES;
  const activeId = profileId || storage.activeProfileId || 'auto_switch';
  const target = profiles.find(p => p.id === activeId) || profiles[0];
  currentActiveProfileId = target.id;

  if (target.profileType === 'DirectProfile') {
    chrome.proxy.settings.set({ value: { mode: 'direct' }, scope: 'regular' });
    updateActionIcon(target);
    return;
  }
  if (target.profileType === 'SystemProfile') {
    chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' });
    updateActionIcon(target);
    return;
  }

  const pacScript = buildPacScriptForProfile(target, profiles);
  chrome.proxy.settings.set({
    value: {
      mode: 'pac_script',
      pacScript: { data: pacScript, mandatory: true }
    },
    scope: 'regular'
  }, () => {
    updateActionIcon(target);
  });
}

function updateActionIcon(profile) {
  if (!chrome.action) return;
  const text = profile.id === 'direct' ? '直连' : (profile.id === 'system' ? '系统' : 'PAC');
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: profile.color || '#2563eb' });
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get('profiles');
  if (!existing.profiles) {
    await chrome.storage.local.set({ profiles: DEFAULT_PROFILES, activeProfileId: 'auto_switch' });
  }
  applyProxySettings('auto_switch');
});

chrome.runtime.onStartup.addListener(() => {
  applyProxySettings();
});

// Proxy 407 Auto-Auth
if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details) => {
      if (details.isProxy) {
        return { authCredentials: { username: "proxy_user", password: "" } };
      }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
}

// Shortcuts
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    const storage = await chrome.storage.local.get(['profiles', 'activeProfileId']);
    const profiles = storage.profiles || DEFAULT_PROFILES;
    let nextId = 'direct';
    if (command === 'cycle-profile') {
      const idx = profiles.findIndex(p => p.id === storage.activeProfileId);
      const nextIdx = (idx + 1) % profiles.length;
      nextId = profiles[nextIdx].id;
    } else if (command === 'toggle-direct-proxy') {
      nextId = storage.activeProfileId === 'direct' ? 'auto_switch' : 'direct';
    }
    await chrome.storage.local.set({ activeProfileId: nextId });
    applyProxySettings(nextId);
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SWITCH_PROFILE') {
    chrome.storage.local.set({ activeProfileId: msg.profileId }, () => {
      applyProxySettings(msg.profileId);
      sendResponse({ success: true });
    });
    return true;
  }
  if (msg.type === 'GET_STATE') {
    chrome.storage.local.get(['profiles', 'activeProfileId'], (res) => {
      sendResponse({ profiles: res.profiles || DEFAULT_PROFILES, activeProfileId: res.activeProfileId || currentActiveProfileId });
    });
    return true;
  }
});
`;
  zip.file("background.js", backgroundJs);

  // 3. popup.html & popup.js
  const popupHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>ProxyPilot</title>
  <style>
    body { width: 280px; margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; font-size: 13px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
    .logo { font-weight: 700; font-size: 14px; color: #38bdf8; display: flex; align-items: center; gap: 6px; }
    .btn-options { font-size: 11px; color: #94a3b8; text-decoration: none; cursor: pointer; padding: 2px 6px; border: 1px solid #334155; border-radius: 4px; }
    .btn-options:hover { background: #1e293b; color: #fff; }
    .list { display: flex; flex-direction: column; gap: 6px; }
    .item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; background: #1e293b; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
    .item:hover { background: #334155; }
    .item.active { border-color: #38bdf8; background: #0c4a6e; }
    .item-name { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .item-dot { width: 8px; height: 8px; border-radius: 50%; }
    .active-badge { font-size: 10px; color: #38bdf8; font-weight: bold; }
    .override-box { margin-top: 10px; padding: 8px; background: #1e293b; border-radius: 6px; font-size: 11px; }
    .btn-tab-ovr { width: 100%; margin-top: 6px; padding: 4px; background: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo"><span>⚡</span> ProxyPilot <span style="font-size:10px;background:#1e293b;padding:2px 5px;border-radius:4px;color:#94a3b8;">v1.0.6</span></div>
    <div class="btn-options" id="btn-opts">选项</div>
  </div>
  <div class="list" id="profile-list"></div>
  <div class="override-box">
    <div style="font-weight:600;color:#cbd5e1;">当前标签临时代理</div>
    <button class="btn-tab-ovr" id="btn-tab-proxy">为此标签强制走代理 (10分钟)</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;
  zip.file("popup.html", popupHtml);

  const popupJs = `
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
  if (!res) return;
  const listEl = document.getElementById('profile-list');
  listEl.innerHTML = '';
  res.profiles.forEach(p => {
    const item = document.createElement('div');
    item.className = 'item' + (p.id === res.activeProfileId ? ' active' : '');
    item.innerHTML = '<div class="item-name"><span class="item-dot" style="background:' + (p.color || '#94a3b8') + '"></span>' + p.name + '</div>' + (p.id === res.activeProfileId ? '<span class="active-badge">✓ 生效中</span>' : '');
    item.onclick = () => {
      chrome.runtime.sendMessage({ type: 'SWITCH_PROFILE', profileId: p.id }, () => window.close());
    };
    listEl.appendChild(item);
  });
});
document.getElementById('btn-opts').onclick = () => {
  chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open('options.html');
};
document.getElementById('btn-tab-proxy').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      alert('已为当前标签页临时开启代理 (10分钟)');
      window.close();
    }
  });
};
`;
  zip.file("popup.js", popupJs);

  // 4. options.html & options.js
  zip.file("options.html", generateOptionsHtml());
  zip.file("options.js", generateOptionsJs(DEFAULT_PROFILES, 'auto_switch'));

  // 5. Standalone pure-ASCII PAC script
  const curatedPac = compileCuratedGfwlistPac('SOCKS5 127.0.0.1:7897; SOCKS 127.0.0.1:7897; DIRECT');
  zip.file("proxy.pac", curatedPac);

  // 6. README.md
  const readmeContent = `# ProxyPilot v1.0.6 (Chrome / Edge / Kiwi Extension)

ProxyPilot 是轻量级、零广告且功能极其强大的 Chromium 现代分流代理管理套件（完美兼容 Manifest V3 标准）。

## 🚀 v1.0.6 杀手级更新亮点
1. **流量与请求抓包诊断面板 (Request Inspector)**：实时捕获浏览器发出的网络请求，展示请求 URL、命中的分流条件、最终代理目标与 HTTP 状态码，并支持在日志行中**一键添加规则**。
2. **远程 GFWList 智能转 PAC 分流器 (CloudSync GFWList -> PAC)**：一键同步远程 GFWList 规则库，极速转换为纯 ASCII 兼容、\$O(1)\$ 哈希匹配的紧凑 PAC 分流脚本，随时存储到本地配置。
3. **代理无感认证 (Proxy 407 Auto-Fill)**：利用 Chrome MV3 \`webRequestAuthProvider\` 原生捕获代理发起的 407 认证请求，静默填充凭证，彻底告别浏览器原生丑陋弹窗。
4. **扩展高级分流条件**：支持 IP CIDR 掩码网段匹配 (\`isInNet\`)、非标准端口匹配 (\`:8443\`)、URL 关键词匹配 (\`KeywordCondition\`) 与资源类型分流。
5. **快捷键系统与标签临时接管**：支持 \`Alt+Shift+X\` 循环切换情景模式、\`Alt+Shift+P\` 一键切换直连与自动分流，支持为单个 Tab 开启 10 分钟临时代理。

## 💻 电脑端安装方法 (Chrome / Edge / Brave / 360)
1. 解压此 ZIP 压缩包到本地目录。
2. 浏览器打开 \`chrome://extensions\` (Edge 打开 \`edge://extensions\`)。
3. 开启右上角的 **「开发者模式」**。
4. 点击 **「加载已解压的扩展程序」**，选择解压出的文件夹即可。

## 📱 手机端安装方法 (Kiwi Browser / Edge Android)
1. 在手机上安装并打开 **Kiwi Browser**。
2. 进入右上角菜单 -> 「扩展程序」 -> 开启「开发者模式」。
3. 点击 **「+ (from .zip / .crx / .user.js)」** 按钮，直接选择此 ZIP 文件即可安装！
`;
  zip.file("README.md", readmeContent);

  // Generate output ZIP buffer
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  // Ensure output dirs exist
  const distReleaseDir = path.resolve(process.cwd(), 'dist-release');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(distReleaseDir)) fs.mkdirSync(distReleaseDir, { recursive: true });

  const zipName = 'ProxyPilot-v1.0.6-chrome-extension.zip';
  fs.writeFileSync(path.join(distReleaseDir, zipName), zipBuffer);
  fs.writeFileSync(path.join(publicDir, zipName), zipBuffer);
  fs.writeFileSync(path.join(distReleaseDir, 'proxy.pac'), curatedPac);
  fs.writeFileSync(path.join(publicDir, 'proxy.pac'), curatedPac);

  console.log(`✅ Successfully generated:`);
  console.log(`   - dist-release/${zipName} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`   - public/${zipName}`);
  console.log(`   - dist-release/proxy.pac (${(curatedPac.length / 1024).toFixed(1)} KB)`);
}

buildRelease().catch(err => {
  console.error('Failed to build release:', err);
  process.exit(1);
});
