import JSZip from 'jszip';
import { Profile } from '../types/omega';
import { generatePacScript } from './pacGenerator';
import { generateOptionsHtml, generateOptionsJs } from './extensionOptionsApp';

/**
 * Creates a fully functioning, load-unpacked ready Chrome/Edge/Kiwi Manifest V3 extension ZIP
 */
export async function buildExtensionZipObject(profiles: Profile[], activeProfileId: string): Promise<JSZip> {
  const zip = new JSZip();

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const pacCode = generatePacScript(activeProfile, profiles);

  // 1. manifest.json (Manifest V3)
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
// Strictly ASCII-compliant proxy manager for Chrome, Edge, and Kiwi Browser.

const DEFAULT_PROFILES = ${JSON.stringify(profiles, null, 2)};
let currentActiveProfileId = ${JSON.stringify(activeProfileId)};

// Enforce strictly pure ASCII characters (charCode <= 127) for Chromium PAC specification
function toPureAscii(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\\x00-\\x7F]/g, '');
}

// Format PAC proxy return instruction (e.g. 'SOCKS5 127.0.0.1:7897; DIRECT')
function formatPacStatement(prof) {
  if (!prof) return 'DIRECT';
  if (prof.profileType === 'DirectProfile') return 'DIRECT';
  if (prof.profileType === 'SystemProfile') return 'SYSTEM';
  if (prof.profileType === 'FixedProfile' && prof.fallbackProxy) {
    const p = prof.fallbackProxy;
    const host = toPureAscii(p.host || '127.0.0.1');
    const port = p.port || 7897;
    const scheme = (p.scheme || 'socks5').toLowerCase();
    if (scheme === 'socks5') {
      return 'SOCKS5 ' + host + ':' + port + '; SOCKS ' + host + ':' + port + '; DIRECT';
    }
    if (scheme === 'socks4') {
      return 'SOCKS ' + host + ':' + port + '; DIRECT';
    }
    if (scheme === 'https') {
      return 'HTTPS ' + host + ':' + port + '; DIRECT';
    }
    return 'PROXY ' + host + ':' + port + '; DIRECT';
  }
  return 'DIRECT';
}

// Generate RFC-compliant, 100% pure ASCII FindProxyForURL script
function buildPacScriptForProfile(target, allProfiles) {
  if (target.profileType === 'PacProfile' && target.pacScript) {
    return toPureAscii(target.pacScript);
  }

  if (target.profileType === 'DirectProfile') {
    return '// ProxyPilot PAC Script - Direct\\nfunction FindProxyForURL(url, host) {\\n  return "DIRECT";\\n}';
  }

  if (target.profileType === 'SystemProfile') {
    return '// ProxyPilot PAC Script - System\\nfunction FindProxyForURL(url, host) {\\n  return "SYSTEM";\\n}';
  }

  if (target.profileType === 'FixedProfile') {
    const ret = formatPacStatement(target);
    const bypassLines = (target.bypassList || [])
      .filter(b => b.enabled)
      .map(b => {
        const pat = toPureAscii(b.pattern);
        if (pat === '<local>') {
          return '  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost") return "DIRECT";';
        }
        if (pat.includes('*') || pat.includes('?')) {
          return '  if (shExpMatch(host, "' + pat + '") || shExpMatch(url, "' + pat + '")) return "DIRECT";';
        }
        return '  if (host === "' + pat + '") return "DIRECT";';
      })
      .join('\\n');

    return '// ProxyPilot PAC Script - Fixed Proxy\\n' +
      'function FindProxyForURL(url, host) {\\n' +
      (bypassLines ? bypassLines + '\\n' : '') +
      '  return "' + ret + '";\\n' +
      '}';
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
        ruleLines.push('  // Rule ' + (i + 1) + '\\n  if (shExpMatch(host, "' + cleanPat + '")) return "' + targetRet + '";');
      } else if (r.conditionType === 'UrlWildcardCondition') {
        ruleLines.push('  // Rule ' + (i + 1) + '\\n  if (shExpMatch(url, "' + cleanPat + '")) return "' + targetRet + '";');
      } else if (r.conditionType === 'HostRegexCondition') {
        ruleLines.push('  // Rule ' + (i + 1) + '\\n  if (/' + cleanPat + '/i.test(host)) return "' + targetRet + '";');
      } else if (r.conditionType === 'UrlRegexCondition') {
        ruleLines.push('  // Rule ' + (i + 1) + '\\n  if (/' + cleanPat + '/i.test(url)) return "' + targetRet + '";');
      } else if (r.conditionType === 'KeywordCondition') {
        ruleLines.push('  // Rule ' + (i + 1) + '\\n  if (url.indexOf("' + cleanPat + '") !== -1 || host.indexOf("' + cleanPat + '") !== -1) return "' + targetRet + '";');
      } else if (r.conditionType === 'IpCidrCondition') {
        var parts = cleanPat.split('/');
        var cidrIp = parts[0] || '';
        var cidrPrefix = parseInt(parts[1] || '32', 10);
        var p = Math.max(0, Math.min(32, cidrPrefix));
        var maskArr = [];
        var rem = p;
        for (var mi = 0; mi < 4; mi++) {
          var n = Math.min(rem, 8);
          maskArr.push(256 - Math.pow(2, 8 - n));
          rem -= n;
        }
        var cidrMask = maskArr.join('.');
        ruleLines.push('  // Rule ' + (i + 1) + ' CIDR\\n  if (isInNet(dnsResolve(host), "' + cidrIp + '", "' + cidrMask + '")) return "' + targetRet + '";');
      } else if (r.conditionType === 'PortCondition') {
        var portStr = cleanPat.replace(/^:/, '').trim();
        ruleLines.push('  // Rule ' + (i + 1) + ' Port\\n  var pMatch = (url.match(/:([0-9]+)/) || [])[1];\\n  if (pMatch === "' + portStr + '") return "' + targetRet + '";');
      } else if (r.conditionType === 'SchemeCondition') {
        var schemeStr = cleanPat.replace(/:$/, '').trim().toLowerCase();
        ruleLines.push('  // Rule ' + (i + 1) + ' Scheme\\n  if (url.indexOf("' + schemeStr + ':") === 0) return "' + targetRet + '";');
      } else if (r.conditionType === 'ResourceTypeCondition') {
        var rt = cleanPat.toLowerCase();
        if (rt.indexOf('image') !== -1) {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type (Image)\\n  if (/\\.(png|jpe?g|gif|webp|svg|ico)(\\?.*)?$/i.test(url)) return "' + targetRet + '";');
        } else if (rt.indexOf('media') !== -1 || rt.indexOf('video') !== -1) {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type (Media)\\n  if (/\\.(mp4|webm|m3u8|ts|mp3|ogg|flv|wav)(\\?.*)?$/i.test(url)) return "' + targetRet + '";');
        } else if (rt.indexOf('script') !== -1 || rt.indexOf('js') !== -1) {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type (Script)\\n  if (/\\.js(\\?.*)?$/i.test(url)) return "' + targetRet + '";');
        } else if (rt.indexOf('style') !== -1 || rt.indexOf('css') !== -1) {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type (CSS)\\n  if (/\\.css(\\?.*)?$/i.test(url)) return "' + targetRet + '";');
        } else if (rt.indexOf('ws') !== -1 || rt.indexOf('websocket') !== -1) {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type (WebSocket)\\n  if (/^wss?:/i.test(url)) return "' + targetRet + '";');
        } else {
          ruleLines.push('  // Rule ' + (i + 1) + ' Resource Type\\n  if (shExpMatch(url, "' + cleanPat + '")) return "' + targetRet + '";');
        }
      }
    }

    let ruleListBlock = '';
    if (sw.ruleListConfig && sw.ruleListConfig.enabled && sw.ruleListConfig.rulesText) {
      const listTarget = allProfiles.find(p => p.id === sw.ruleListConfig.profileId);
      const listRet = formatPacStatement(listTarget);

      const rLines = sw.ruleListConfig.rulesText.split(/\r?\n/);
      const proxyMap: Record<string, number> = {};
      const whiteMap: Record<string, number> = {};
      for (let li = 0; li < rLines.length; li++) {
        const l = rLines[li].trim();
        if (!l || l.charAt(0) === '!' || l.charAt(0) === '[') continue;
        if (l.indexOf('@@') === 0) {
          const clean = toPureAscii(l.replace(/^@@(\|\|)?/, '').replace(/^https?:\/\//, '').split('/')[0].trim().toLowerCase());
          if (clean && clean.indexOf('*') === -1 && clean.indexOf('^') === -1) whiteMap[clean] = 1;
        } else if (l.indexOf('||') === 0) {
          const clean = toPureAscii(l.substring(2).replace(/^\/+/, '').split('/')[0].trim().toLowerCase());
          if (clean && clean.indexOf('*') === -1 && clean.indexOf('^') === -1) proxyMap[clean] = 1;
        } else if (l.charAt(0) !== '|' && l.charAt(0) !== '/' && l.indexOf('.') !== -1 && l.indexOf(' ') === -1 && l.indexOf('*') === -1) {
          const clean = toPureAscii(l.split('/')[0].trim().toLowerCase());
          if (clean) proxyMap[clean] = 1;
        }
      }

      ruleListBlock = '\\n  // GFWList / Online Rule List Segment (Fast Hash Map)\\n' +
        '  var gfwWhite = ' + JSON.stringify(whiteMap) + ';\\n' +
        '  var gfwProxy = ' + JSON.stringify(proxyMap) + ';\\n' +
        '  if (matchDomainMap(host, gfwWhite)) return "DIRECT";\\n' +
        '  if (matchDomainMap(host, gfwProxy)) return "' + listRet + '";\\n';
    }

    return '// ProxyPilot PAC Script - Auto Switch\\n' +
      'function FindProxyForURL(url, host) {\\n' +
      '  // Mandatory Security Direct Whitelist (Never Proxy)\\n' +
      '  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1" || ' +
      'shExpMatch(host, "*.gov.cn") || shExpMatch(host, "*.edu.cn") || ' +
      'shExpMatch(host, "*.icbc.com.cn") || shExpMatch(host, "*.ccb.com") || shExpMatch(host, "*.boc.cn") || ' +
      'shExpMatch(host, "*.abchina.com") || shExpMatch(host, "*.cmbchina.com") || shExpMatch(host, "*.alipay.com") || ' +
      'isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") || isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") || isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")) {\\n' +
      '    return "DIRECT";\\n' +
      '  }\\n\\n' +
      ruleLines.join('\\n\\n') +
      ruleListBlock +
      '\\n  // Default fallback\\n' +
      '  return "' + defaultRet + '";\\n' +
      '}\\n\\n' +
      'function matchDomainMap(h, map) {\\n' +
      '  if (!h || !map) return false;\\n' +
      '  h = h.toLowerCase();\\n' +
      '  if (map[h]) return true;\\n' +
      '  var dot = h.indexOf(".");\\n' +
      '  while (dot !== -1) {\\n' +
      '    var parent = h.substring(dot + 1);\\n' +
      '    if (map[parent]) return true;\\n' +
      '    dot = h.indexOf(".", dot + 1);\\n' +
      '  }\\n' +
      '  return false;\\n' +
      '}';
  }

  return '// ProxyPilot Fallback\\nfunction FindProxyForURL(url, host) { return "DIRECT"; }';
}

// Update Extension Icon Badge & Tooltip
function updateActionBadge(target) {
  if (!chrome.action) return;
  let badgeText = '7897';
  let badgeColor = '#10b981';
  if (target.profileType === 'DirectProfile') {
    badgeText = 'DIR';
    badgeColor = '#64748b';
  } else if (target.profileType === 'SystemProfile') {
    badgeText = 'SYS';
    badgeColor = '#0284c7';
  } else if (target.profileType === 'SwitchProfile') {
    badgeText = 'AUTO';
    badgeColor = '#f59e0b';
  } else if (target.profileType === 'PacProfile') {
    badgeText = 'PAC';
    badgeColor = '#8b5cf6';
  } else if (target.profileType === 'FixedProfile' && target.fallbackProxy) {
    badgeText = String(target.fallbackProxy.port || '7897');
    badgeColor = '#10b981';
  }

  try {
    if (chrome.action.setBadgeText) chrome.action.setBadgeText({ text: badgeText });
    if (chrome.action.setBadgeBackgroundColor) chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    if (chrome.action.setTitle) {
      chrome.action.setTitle({
        title: 'ProxyPilot (当前已接管浏览器代理: ' + target.name + ' [' + badgeText + '])'
      });
    }
  } catch (e) {}
}

let lastControlStatus = {
  levelOfControl: 'controllable_by_this_extension',
  activeProfileId: currentActiveProfileId,
  warningMessage: ''
};

function verifyProxyControl(label) {
  if (chrome.proxy && chrome.proxy.settings && chrome.proxy.settings.get) {
    chrome.proxy.settings.get({ incognito: false }, (details) => {
      const loc = details ? details.levelOfControl : 'unknown';
      let warn = '';
      if (loc === 'controlled_by_other_extensions') {
        warn = '检测到浏览器中安装了其他代理扩展（如 SwitchyOmega、Clash Verge 等），正在占用代理控制权。请在 chrome://extensions 临时禁用其他代理插件。';
        console.warn('[ProxyPilot] Warning:', warn);
      } else if (loc === 'not_controllable') {
        warn = '浏览器代理被系统或企业策略锁定，无法由扩展程序修改。';
        console.warn('[ProxyPilot] Warning:', warn);
      } else {
        console.log('[ProxyPilot] Verified: ProxyPilot is in full control of browser proxy settings (' + loc + ')');
      }
      lastControlStatus = {
        levelOfControl: loc,
        activeProfileId: currentActiveProfileId,
        warningMessage: warn
      };
    });
  }
}

// Safely apply proxy settings and inspect chrome.runtime.lastError
function setChromeProxy(config, label) {
  if (!chrome.proxy || !chrome.proxy.settings) {
    console.warn('[ProxyPilot] chrome.proxy.settings API not available');
    return;
  }
  chrome.proxy.settings.set({
    value: config,
    scope: 'regular'
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('[ProxyPilot] Error applying proxy (' + label + '):', chrome.runtime.lastError.message);
    } else {
      console.log('[ProxyPilot] Successfully applied proxy settings to browser:', label);
      verifyProxyControl(label);
    }
  });
}

// Apply proxy settings using Chrome Proxy API
async function applyProxySettings(profileId) {
  currentActiveProfileId = profileId;
  await chrome.storage.local.set({ activeProfileId: profileId });

  const stored = await chrome.storage.local.get(['profiles']);
  const allProfiles = stored.profiles || DEFAULT_PROFILES;
  const target = allProfiles.find(p => p.id === profileId) || allProfiles[0];

  console.log('[ProxyPilot] Switching and taking over browser proxy with profile:', target.name, target.profileType);
  updateActionBadge(target);

  if (target.profileType === 'DirectProfile') {
    setChromeProxy({ mode: 'direct' }, 'Direct Mode');
  } else if (target.profileType === 'SystemProfile') {
    setChromeProxy({ mode: 'system' }, 'System Mode');
  } else if (target.profileType === 'FixedProfile') {
    const scheme = target.fallbackProxy.scheme;
    const pHost = toPureAscii(target.fallbackProxy.host || '127.0.0.1');
    const pPort = parseInt(target.fallbackProxy.port || 7897, 10);
    const bypass = (target.bypassList || [])
      .filter(b => b.enabled)
      .map(b => toPureAscii(b.pattern))
      .filter(Boolean);
    if (bypass.length === 0) bypass.push('<local>');

    setChromeProxy({
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: scheme === 'socks5' || scheme === 'socks4' ? scheme : 'http',
          host: pHost,
          port: pPort
        },
        bypassList: bypass
      }
    }, 'Fixed Proxy (' + pHost + ':' + pPort + ')');
  } else if (target.profileType === 'SwitchProfile' || target.profileType === 'PacProfile') {
    // Generate 100% pure ASCII PAC Script
    const rawPac = buildPacScriptForProfile(target, allProfiles);
    const pureAsciiPac = toPureAscii(rawPac);

    setChromeProxy({
      mode: 'pac_script',
      pacScript: {
        data: pureAsciiPac
      }
    }, 'PAC Script Mode (' + target.profileType + ')');
  }
}

// Lifecycle listeners
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['profiles', 'activeProfileId']);
  if (!existing.profiles || !Array.isArray(existing.profiles) || existing.profiles.length === 0) {
    await chrome.storage.local.set({ 
      profiles: DEFAULT_PROFILES,
      activeProfileId: currentActiveProfileId
    });
  }
  applyProxySettings(existing.activeProfileId || currentActiveProfileId);
});

// Proxy Credentials Auto-Authentication (MV3 webRequestAuthProvider)
if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, callback) => {
      chrome.storage.local.get(['profiles', 'activeProfileId'], (res) => {
        const allProfiles = res.profiles || DEFAULT_PROFILES;
        for (let i = 0; i < allProfiles.length; i++) {
          const prof = allProfiles[i];
          if (prof.profileType === 'FixedProfile' && prof.fallbackProxy && prof.fallbackProxy.auth) {
            const u = prof.fallbackProxy.auth.username;
            const p = prof.fallbackProxy.auth.password;
            if (u && p) {
              return callback({ authCredentials: { username: u, password: p } });
            }
          }
        }
        callback({});
      });
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
  );
}

// In-Memory Request Logging Ring Buffer (Max 200 items for Network Debug Panel)
const MAX_REQUEST_LOGS = 200;
const requestLogs = [];

if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      try {
        const u = new URL(details.url);
        requestLogs.unshift({
          id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          timestamp: Date.now(),
          url: details.url,
          method: details.method || 'GET',
          type: details.type || 'other',
          host: u.hostname,
          port: u.port || (u.protocol === 'https:' ? '443' : '80'),
          scheme: u.protocol.replace(':', ''),
          tabId: details.tabId
        });
        if (requestLogs.length > MAX_REQUEST_LOGS) requestLogs.pop();
      } catch (e) {}
    },
    { urls: ['<all_urls>'] }
  );
}

// Hotkey Keyboard Shortcut Listener (chrome.commands)
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'cycle-profile') {
      const stored = await chrome.storage.local.get(['profiles', 'activeProfileId']);
      const all = stored.profiles || DEFAULT_PROFILES;
      const currentId = stored.activeProfileId || currentActiveProfileId;
      const currentIdx = all.findIndex(p => p.id === currentId);
      const nextIdx = (currentIdx + 1) % all.length;
      const nextProfile = all[nextIdx];
      if (nextProfile) {
        await applyProxySettings(nextProfile.id);
        if (chrome.action && chrome.action.setBadgeText) {
          chrome.action.setBadgeText({ text: nextProfile.name.slice(0, 3) });
          chrome.action.setBadgeBackgroundColor({ color: nextProfile.color || '#2563eb' });
        }
      }
    } else if (command === 'toggle-direct-proxy') {
      const stored = await chrome.storage.local.get(['profiles', 'activeProfileId']);
      const currentId = stored.activeProfileId || currentActiveProfileId;
      const targetId = currentId === 'auto_switch' ? 'proxy_clash' : (currentId === 'direct' ? 'auto_switch' : 'direct');
      await applyProxySettings(targetId);
      if (chrome.action && chrome.action.setBadgeText) {
        chrome.action.setBadgeText({ text: targetId.slice(0, 3) });
      }
    }
  });
}

// Auto-Learn Failure Monitor (Captures connection reset / timed out for Smart Routing)
const autoLearnFailures = [];
if (chrome.webRequest && chrome.webRequest.onErrorOccurred) {
  chrome.webRequest.onErrorOccurred.addListener((details) => {
    try {
      const u = new URL(details.url);
      const h = u.hostname;
      if (h && !h.endsWith('.gov.cn') && !h.endsWith('.edu.cn') && !autoLearnFailures.some(f => f.host === h)) {
        autoLearnFailures.unshift({
          id: 'fail_' + Date.now(),
          host: h,
          url: details.url,
          error: details.error,
          timestamp: Date.now()
        });
        if (autoLearnFailures.length > 50) autoLearnFailures.pop();
      }
    } catch (e) {}
  }, { urls: ['<all_urls>'] });
}

// Tab Overrides Dictionary (tabId -> { profileId, expireAt })
const tabOverrides = {};

// Messages from popup or options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_STATE') {
    chrome.storage.local.get(['profiles', 'activeProfileId'], (res) => {
      const validProfiles = (res && Array.isArray(res.profiles) && res.profiles.length > 0) 
        ? res.profiles 
        : DEFAULT_PROFILES;
      sendResponse({
        profiles: validProfiles,
        activeProfileId: (res && res.activeProfileId) || currentActiveProfileId,
        tabOverrides: tabOverrides
      });
    });
    return true;
  }
  if (request.type === 'GET_PROXY_CONTROL_STATUS') {
    if (chrome.proxy && chrome.proxy.settings && chrome.proxy.settings.get) {
      chrome.proxy.settings.get({ incognito: false }, (details) => {
        const loc = (details && details.levelOfControl) || 'unknown';
        let warn = '';
        if (loc === 'controlled_by_other_extensions') {
          warn = '检测到其他代理插件正在占用浏览器代理控制权，请在 chrome://extensions 中关闭其他代理扩展。';
        } else if (loc === 'not_controllable') {
          warn = '浏览器代理被系统或企业组策略锁定。';
        }
        sendResponse({
          levelOfControl: loc,
          isControlledByThisExtension: loc === 'controlled_by_this_extension',
          activeProfileId: currentActiveProfileId,
          warningMessage: warn
        });
      });
    } else {
      sendResponse(lastControlStatus);
    }
    return true;
  }
  if (request.type === 'SWITCH_PROFILE') {
    applyProxySettings(request.profileId).then(() => {
      sendResponse({ success: true, activeProfileId: request.profileId });
    });
    return true;
  }
  if (request.type === 'OVERRIDE_TAB_PROFILE') {
    if (request.tabId) {
      if (request.profileId) {
        tabOverrides[request.tabId] = { profileId: request.profileId, expireAt: request.expireAt || 0 };
      } else {
        delete tabOverrides[request.tabId];
      }
    }
    sendResponse({ success: true, tabOverrides });
    return true;
  }
  if (request.type === 'GET_REQUEST_LOGS') {
    sendResponse({ logs: requestLogs });
    return true;
  }
  if (request.type === 'CLEAR_REQUEST_LOGS') {
    requestLogs.length = 0;
    sendResponse({ success: true });
    return true;
  }
  if (request.type === 'GET_AUTO_LEARN_FAILURES') {
    sendResponse({ failures: autoLearnFailures });
    return true;
  }
  if (request.type === 'BATCH_SET_PORT') {
    chrome.storage.local.get(['profiles', 'activeProfileId'], (res) => {
      const all = res.profiles || DEFAULT_PROFILES;
      const port = parseInt(request.port || 7897, 10);
      for (let i = 0; i < all.length; i++) {
        if (all[i].profileType === 'FixedProfile' && all[i].fallbackProxy) {
          all[i].fallbackProxy.port = port;
        }
      }
      chrome.storage.local.set({ profiles: all }, async () => {
        await applyProxySettings(res.activeProfileId || currentActiveProfileId);
        sendResponse({ success: true, profiles: all });
      });
    });
    return true;
  }
  if (request.type === 'SAVE_STATE') {
    chrome.storage.local.set({
      profiles: request.profiles,
      activeProfileId: request.activeProfileId || currentActiveProfileId
    }, async () => {
      if (request.apply) {
        await applyProxySettings(request.activeProfileId || currentActiveProfileId);
      }
      sendResponse({ success: true });
    });
    return true;
  }
});
`;
  zip.file("background.js", backgroundJs);

  // 3. popup.html (Responsive for desktop & mobile Kiwi Browser)
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ProxyPilot</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      width: 100%;
      min-width: 290px;
      max-width: 380px;
      margin: 0 auto;
      padding: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #f8fafc;
      -webkit-tap-highlight-color: transparent;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .title {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .current-domain {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
    }
    .domain-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .profiles-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .profile-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      min-height: 44px;
      border-radius: 8px;
      cursor: pointer;
      background: #ffffff;
      transition: all 0.15s;
      border: 1px solid #e2e8f0;
    }
    .profile-item:active {
      background: #e2e8f0;
    }
    .profile-item.active {
      background: #eff6ff;
      border-color: #2563eb;
      font-weight: 600;
    }
    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .rule-add-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .override-box {
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .override-title {
      font-size: 11px;
      font-weight: 700;
      color: #92400e;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .override-btn {
      background: #f59e0b;
      color: #ffffff;
      border: none;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
    }
    .override-btn:active {
      background: #d97706;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 12px;
      min-height: 44px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn:active {
      background: #1d4ed8;
      transform: scale(0.98);
    }
    .footer-link {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 6px;
    }
    .footer-link a {
      color: #64748b;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: 4px;
    }
    .footer-link a:hover {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">
      <span style="display:inline-block;width:12px;height:12px;background:#2563eb;border-radius:3px;"></span>
      ProxyPilot
    </div>
    <span id="status-badge" style="font-size:11px;color:#10b981;font-weight:700;">ACTIVE (7897)</span>
  </div>

  <!-- Conflict Alert Banner -->
  <div id="conflict-alert" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:8px;padding:8px 10px;font-size:11px;margin-bottom:10px;line-height:1.4;">
    <strong>⚠️ 代理权冲突：</strong>检测到其他代理插件（如 SwitchyOmega）正在占用浏览器控制权，请在 <code>chrome://extensions</code> 中关闭冲突扩展。
  </div>

  <!-- Takeover Feedback Toast -->
  <div id="takeover-msg" style="display:none;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:8px;padding:8px 10px;font-size:11px;margin-bottom:10px;font-weight:600;text-align:center;">
    ⚡ 正在接管浏览器代理...
  </div>

  <div class="domain-label">当前网页域名</div>
  <div id="domain-display" class="current-domain">loading...</div>

  <!-- Quick Tab Temporary Override -->
  <div class="override-box">
    <div class="override-title">
      <span>⚡ 单标签页临时接管</span>
      <span style="font-size:10px;font-family:monospace;color:#b45309;">Alt+Shift+X</span>
    </div>
    <button id="btn-toggle-override" class="override-btn">临时对此网页走代理 (7897)</button>
  </div>

  <div class="domain-label" style="display:flex;justify-content:space-between;">
    <span>情景模式切换 (点击即接管)</span>
    <span style="font-size:10px;font-weight:normal;color:#94a3b8;">快捷键: Alt+Shift+X</span>
  </div>
  <div id="profile-container" class="profiles-list"></div>

  <div class="rule-add-box">
    <button id="btn-add-rule" class="btn">对此域名添加自动切换规则</button>
  </div>

  <div class="footer-link">
    <a href="#" id="open-inspector" style="color:#2563eb;font-weight:600;">抓包日志诊断</a>
    <a href="#" id="open-options">选项设置 (Options)</a>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
  zip.file("popup.html", popupHtml);

  // 4. popup.js
  const popupJs = `let currentDomain = '';
let currentUrl = '';
let currentTabId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Query proxy control status
  chrome.runtime.sendMessage({ type: 'GET_PROXY_CONTROL_STATUS' }, (statusRes) => {
    if (statusRes && statusRes.warningMessage) {
      const conflictEl = document.getElementById('conflict-alert');
      if (conflictEl) {
        conflictEl.style.display = 'block';
        conflictEl.innerHTML = '<strong>⚠️ 代理权冲突：</strong>' + statusRes.warningMessage;
      }
    }
  });

  // Query active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      currentTabId = tabs[0].id;
      try {
        const u = new URL(tabs[0].url);
        currentDomain = u.hostname;
        currentUrl = tabs[0].url;
        document.getElementById('domain-display').textContent = currentDomain || tabs[0].url;
      } catch {
        document.getElementById('domain-display').textContent = tabs[0].url;
      }
    } else {
      document.getElementById('domain-display').textContent = 'chrome://';
    }
  });

  // Load profiles
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
    if (!res) return;
    const container = document.getElementById('profile-container');
    container.innerHTML = '';

    const curActive = res.profiles.find(p => p.id === res.activeProfileId);
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge && curActive) {
      statusBadge.textContent = curActive.name.substring(0, 14);
    }

    res.profiles.forEach(p => {
      const isAct = p.id === res.activeProfileId;
      const div = document.createElement('div');
      div.className = 'profile-item' + (isAct ? ' active' : '');
      div.innerHTML = \`
        <span class="color-dot" style="background: \${p.color || '#3b82f6'}"></span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;">\${p.name}</span>
        \${isAct ? '<span style="color:#10b981;font-weight:bold;font-size:11px;">● 已接管</span>' : '<span style="font-size:11px;color:#94a3b8;">设为代理</span>'}
      \`;
      div.onclick = () => {
        const takeoverMsg = document.getElementById('takeover-msg');
        if (takeoverMsg) {
          takeoverMsg.style.display = 'block';
          takeoverMsg.textContent = '⚡ 正在将浏览器代理切换至: ' + p.name + '...';
        }
        chrome.runtime.sendMessage({ type: 'SWITCH_PROFILE', profileId: p.id }, () => {
          setTimeout(() => {
            window.location.reload();
          }, 200);
        });
      };
      container.appendChild(div);
    });

    const overrideBtn = document.getElementById('btn-toggle-override');
    if (overrideBtn) {
      overrideBtn.onclick = () => {
        const targetId = res.activeProfileId === 'direct' ? 'proxy_clash' : 'direct';
        chrome.runtime.sendMessage({
          type: 'SWITCH_PROFILE',
          profileId: targetId
        }, () => {
          alert('已临时接管分流模式至: ' + targetId);
          window.location.reload();
        });
      };
    }
  });

  document.getElementById('btn-add-rule').onclick = () => {
    if (!currentDomain) return;
    const wildcard = '*.' + (currentDomain.replace(/^www\\./, ''));
    chrome.runtime.sendMessage({
      type: 'ADD_RULE',
      pattern: wildcard,
      targetProfileId: 'proxy_clash'
    }, (res) => {
      alert('已成功添加分流规则: ' + wildcard + ' -> 7897 代理端口');
    });
  };

  document.getElementById('open-inspector').onclick = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html#tab=inspector') });
  };

  document.getElementById('open-options').onclick = (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  };
});
`;
  zip.file("popup.js", popupJs);

  // 5. options.html & assets (Package the EXACT React SPA application identical to the preview window)
  let packagedReactOptions = false;
  try {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      const manifestResp = await fetch('/extension-build/assets-manifest.json');
      if (manifestResp.ok) {
        const manifest = await manifestResp.json();
        const htmlResp = await fetch('/extension-build/options.html');
        if (htmlResp.ok) {
          const htmlContent = await htmlResp.text();
          zip.file("options.html", htmlContent);
          
          if (Array.isArray(manifest.assets)) {
            for (const assetName of manifest.assets) {
              const assetResp = await fetch('/extension-build/assets/' + assetName);
              if (assetResp.ok) {
                const assetContent = await assetResp.text();
                zip.file("assets/" + assetName, assetContent);
              }
            }
          }
          packagedReactOptions = true;
        }
      }
    } else if (typeof process !== 'undefined') {
      // Node environment
      const fs = await import('fs');
      const path = await import('path');
      const targetDir = path.resolve(process.cwd(), 'public/extension-build');
      const optHtmlPath = path.join(targetDir, 'options.html');
      if (fs.existsSync(optHtmlPath)) {
        const html = fs.readFileSync(optHtmlPath, 'utf-8');
        zip.file("options.html", html);
        const assetsDir = path.join(targetDir, 'assets');
        if (fs.existsSync(assetsDir)) {
          const files = fs.readdirSync(assetsDir);
          for (const f of files) {
            const assetContent = fs.readFileSync(path.join(assetsDir, f), 'utf-8');
            zip.file("assets/" + f, assetContent);
          }
        }
        packagedReactOptions = true;
      }
    }
  } catch (e) {
    console.warn('[ProxyPilot] Could not package compiled React options build, using fallback template:', e);
  }

  // Fallback if react build could not be fetched
  if (!packagedReactOptions) {
    const optionsHtml = generateOptionsHtml();
    zip.file("options.html", optionsHtml);
    const optionsJs = generateOptionsJs(profiles, activeProfileId);
    zip.file("options.js", optionsJs);
  }

  // 6. proxy.pac
  zip.file("proxy.pac", pacCode);

  // 7. README.md
  const readmeMd = `# ProxyPilot 浏览器代理拓展插件 (Chrome / Edge / Kiwi / Firefox)

欢迎使用 ProxyPilot 扩展插件！完全基于 Chromium 最新 Manifest V3 规范打造，默认采用 **7897** 代理端口。

---

## 📱 手机端 (Kiwi Browser / Edge Android) 极速安装步骤:

安卓端推荐使用 **Kiwi Browser**（原生完美支持 Chrome MV3 扩展）：

1. 在安卓手机打开 **Kiwi Browser**。
2. 点击右上角菜单按钮 **\`⋮\`** -> 选择 **「扩展程序」(Extensions)**。
3. 勾选右上角 **「开发者模式」(Developer Mode)** 开关。
4. 点击左上角的 **\`+ (from .zip / .crx / .user.js)\`** 按钮。
5. 在手机文件选择器中，直接选择刚刚下载的 **\`ProxyPilot-Chrome-Extension-v1.0.6.zip\`**（Kiwi 原生支持直接安装 ZIP，**无需解压**！）。
6. 安装完成！点击 Kiwi 菜单栏最底部的 ProxyPilot 即可在手机上像电脑一样一键切换分流和管理规则！

---

## 💻 电脑端 (Chrome / Edge / Brave / 360) 安装步骤:

1. **解压此 ZIP 压缩包** 到本地文件夹（例如 \`D:\\ProxyPilot-Extension\`）。
2. 浏览器地址栏输入：
   - 谷歌 Chrome 浏览器：\`chrome://extensions\`
   - 微软 Edge 浏览器：\`edge://extensions\`
3. 开启页面右上角的 **"开发者模式" (Developer Mode)**。
4. 点击左上角的 **"加载已解压的扩展程序" (Load unpacked)**。
5. 选择解压出的包含 \`manifest.json\` 的文件夹即可完成安装！

---

## ⚙️ 默认端口配置说明:
- 默认代理端口：**127.0.0.1:7897** (对应 Clash / Mihomo / Sing-box / Clash Verge 现代混合端口)。
- 规则匹配优先级自上而下，支持域名通配符、正则与 GFWList 在线规则列表。

祝您使用愉快！
`;
  zip.file("README.md", readmeMd);
  return zip;
}

/**
 * Generates an in-browser downloadable Blob for the extension ZIP
 */
export async function generateExtensionZip(profiles: Profile[], activeProfileId: string): Promise<Blob> {
  const zip = await buildExtensionZipObject(profiles, activeProfileId);
  return await zip.generateAsync({ type: 'blob' });
}
