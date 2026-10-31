import { Profile } from '../types/omega';

/**
 * Generates options.html for the unpacked Chrome/Edge/Kiwi extension.
 * Fully styled, responsive, dark/light mode, 100% compliant with Manifest V3 CSP (no inline scripts).
 */
export function generateOptionsHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProxyPilot - Smart Proxy Automation Suite</title>
  <style>
    /* CSS Reset & Variables */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-subtle: #f1f5f9;
      --bg-input: #ffffff;
      --border-color: #e2e8f0;
      --border-focus: #3b82f6;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-subtle: #94a3b8;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --primary-subtle: #eff6ff;
      --accent-green: #10b981;
      --accent-orange: #f59e0b;
      --accent-purple: #8b5cf6;
      --accent-red: #ef4444;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
    }

    html.dark {
      --bg-page: #0b1120;
      --bg-card: #0f172a;
      --bg-card-subtle: #1e293b;
      --bg-input: #1e293b;
      --border-color: #334155;
      --border-focus: #3b82f6;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-subtle: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-subtle: #1e293b;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.5);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.6);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      font-size: 13px;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s, color 0.2s;
    }

    /* Header */
    header {
      background-color: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 40;
      padding: 0 16px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(37,99,235,0.3);
    }
    .brand-text h1 {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .brand-text span {
      font-size: 10px;
      color: var(--text-muted);
      display: block;
    }

    .nav-tabs {
      display: flex;
      align-items: center;
      background: var(--bg-card-subtle);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      gap: 2px;
    }
    .nav-tab-btn {
      background: transparent;
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .nav-tab-btn:hover {
      color: var(--text-main);
    }
    .nav-tab-btn.active {
      background: var(--bg-card);
      color: var(--primary);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
    }
    .btn-outline {
      background-color: transparent;
      border-color: var(--border-color);
      color: var(--text-main);
    }
    .btn-outline:hover {
      background-color: var(--bg-card-subtle);
    }
    .btn-danger {
      color: var(--accent-red);
      background-color: transparent;
      border-color: transparent;
    }
    .btn-danger:hover {
      background-color: rgba(239,68,68,0.1);
    }
    .icon-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn:hover {
      color: var(--text-main);
      background-color: var(--bg-card-subtle);
    }

    /* Main Container */
    .app-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 260px 1fr;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      min-height: calc(100vh - 56px);
    }

    /* Sidebar */
    aside {
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      gap: 20px;
    }
    .sidebar-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .sidebar-section-header a {
      color: var(--primary);
      text-decoration: none;
      cursor: pointer;
    }
    .sidebar-section-header a:hover {
      text-decoration: underline;
    }

    .profile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .profile-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .profile-nav-item:hover {
      background-color: var(--bg-card-subtle);
    }
    .profile-nav-item.active {
      background-color: var(--primary-subtle);
      border-color: var(--primary);
      font-weight: 600;
    }
    .profile-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .profile-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .profile-item-name {
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-item-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-card-subtle);
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .sidebar-footer {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sidebar-footer-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }
    .sidebar-footer-btn:hover {
      background: var(--bg-card-subtle);
      color: var(--text-main);
    }

    /* Content Area */
    main {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(100vh - 56px);
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-sm);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12px;
    }
    th {
      background: var(--bg-card-subtle);
      padding: 8px 12px;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }

    /* Form Controls */
    input[type="text"], input[type="number"], select, textarea {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    input[type="text"]:focus, input[type="number"]:focus, select:focus, textarea:focus {
      border-color: var(--border-focus);
    }
    input.mono, textarea.mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      z-index: 100;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      z-index: 90;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-backdrop.open {
      display: flex;
    }
    .modal-box {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      width: 100%;
      max-width: 520px;
      padding: 24px;
      box-shadow: var(--shadow-lg);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .app-layout {
        grid-template-columns: 1fr;
      }
      aside {
        display: none;
      }
      aside.mobile-open {
        display: flex;
        position: fixed;
        inset: 56px 0 0 0;
        z-index: 50;
      }
      .nav-tabs {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div style="display:flex;align-items:center;gap:12px;">
      <button id="btn-toggle-sidebar" class="icon-btn" style="display:none;" title="Toggle Sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div class="brand">
        <div class="brand-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="6" height="6" rx="1"></rect>
            <rect x="16" y="16" width="6" height="6" rx="1"></rect>
            <rect x="16" y="2" width="6" height="6" rx="1"></rect>
            <path d="M5 8v6a2 2 0 0 0 2 2h9"></path>
            <path d="M19 8v8"></path>
          </svg>
        </div>
        <div class="brand-text">
          <h1>ProxyPilot</h1>
          <span>Smart Proxy Automation Suite</span>
        </div>
      </div>
    </div>

    <!-- Center Navigation Tabs -->
    <div class="nav-tabs">
      <button class="nav-tab-btn active" data-tab="profiles">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        情景模式配置
      </button>
      <button class="nav-tab-btn" data-tab="simulator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        路由分流模拟器
      </button>
      <button class="nav-tab-btn" data-tab="pac">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        PAC 脚本生成
      </button>
      <button class="nav-tab-btn" data-tab="backup">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        备份与预设
      </button>
    </div>

    <!-- Header Actions -->
    <div class="header-actions">
      <button id="btn-theme-toggle" class="icon-btn" title="切换深色/浅色模式">
        <svg id="theme-icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      </button>

      <!-- Active Profile Switcher Dropdown -->
      <select id="header-active-profile-select" style="width:160px;font-weight:600;"></select>

      <button id="btn-save-apply" class="btn btn-primary" title="保存当前规则并立即应用至浏览器代理">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        保存并应用
      </button>
    </div>
  </header>

  <!-- App Body Layout -->
  <div class="app-layout">

    <!-- Left Sidebar -->
    <aside id="app-sidebar">
      <div>
        <div class="sidebar-section-header">
          <span>情景模式 (PROFILES)</span>
          <a id="btn-add-profile">+ 新建</a>
        </div>
        <div id="sidebar-profiles-list" class="profile-nav-list"></div>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-section-header" style="padding-left:4px;">配置与帮助</div>
        <button id="sidebar-btn-backup" class="sidebar-footer-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          备份与还原 (Backup)
        </button>
        <button id="sidebar-btn-help" class="sidebar-footer-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          手机与桌面端安装指南
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main>
      <!-- TAB 1: Profiles Editor -->
      <section id="tab-view-profiles"></section>

      <!-- TAB 2: Route Simulator -->
      <section id="tab-view-simulator" style="display:none;"></section>

      <!-- TAB 3: PAC Script Generation -->
      <section id="tab-view-pac" style="display:none;"></section>

      <!-- TAB 4: Backup & Presets -->
      <section id="tab-view-backup" style="display:none;"></section>
    </main>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span id="toast-msg">已成功应用设置！</span>
  </div>

  <!-- Modal: New Profile -->
  <div id="modal-new-profile" class="modal-backdrop">
    <div class="modal-box">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">新建情景模式</h3>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">情景模式名称</label>
        <input type="text" id="new-profile-name" placeholder="例如: 办公代理 7897" value="新代理 (7897)">
      </div>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">情景模式类型</label>
        <select id="new-profile-type">
          <option value="FixedProfile">代理服务器 (Fixed Proxy - 默认端口 7897)</option>
          <option value="SwitchProfile">自动切换模式 (Auto Switch Rules)</option>
          <option value="PacProfile">PAC 智能脚本模式 (PAC Script)</option>
        </select>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
        <button id="btn-cancel-modal" class="btn btn-outline">取消</button>
        <button id="btn-confirm-new-profile" class="btn btn-primary">立即创建</button>
      </div>
    </div>
  </div>

  <!-- Modal: Installation Guide -->
  <div id="modal-help" class="modal-backdrop">
    <div class="modal-box" style="max-width:640px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">📱 手机与桌面端安装使用指南</h3>
      <div style="font-size:12px;color:var(--text-muted);line-height:1.6;display:flex;flex-direction:column;gap:12px;">
        <div style="background:var(--bg-card-subtle);padding:12px;border-radius:8px;">
          <strong style="color:var(--text-main);">Android 手机端 (Kiwi Browser) 免解压直装：</strong>
          <ol style="margin-left:18px;margin-top:4px;">
            <li>打开 Kiwi 浏览器，点击右上角 <strong>⋮</strong> -> <strong>扩展程序</strong>。</li>
            <li>开启右上角 <strong>开发者模式 (Developer Mode)</strong> 开关。</li>
            <li>点击 <strong>+ (from .zip / .crx)</strong>，直接选取下载的 ZIP 文件即可！</li>
          </ol>
        </div>
        <div style="background:var(--bg-card-subtle);padding:12px;border-radius:8px;">
          <strong style="color:var(--text-main);">电脑端 (Chrome / Edge / Brave)：</strong>
          <ol style="margin-left:18px;margin-top:4px;">
            <li>解压下载的 ZIP 压缩包至本地任意文件夹。</li>
            <li>访问 <code>chrome://extensions</code> 或 <code>edge://extensions</code>。</li>
            <li>开启右上角 <strong>开发者模式</strong>，点击 <strong>加载已解压的扩展程序</strong> 选取解压目录。</li>
          </ol>
        </div>
        <p>默认代理端口：<strong>127.0.0.1:7897</strong> (对应现代 Clash Verge / Mihomo / Sing-box 混合端口)。</p>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:16px;">
        <button id="btn-close-help" class="btn btn-primary">我知道了</button>
      </div>
    </div>
  </div>

  <script src="options.js"></script>
</body>
</html>`;
}

/**
 * Generates options.js for the unpacked extension.
 * Provides full interactivity: rule lists, simulation, pure ASCII PAC export, backups, dark theme, and storage sync.
 */
export function generateOptionsJs(defaultProfiles: Profile[], defaultActiveId: string): string {
  return `// ProxyPilot - Options Application Script (Manifest V3)
// Fully reactive options dashboard matching the desktop AI Studio design.

(function() {
  const INITIAL_PROFILES = ${JSON.stringify(defaultProfiles, null, 2)};
  let profiles = INITIAL_PROFILES;
  let activeProfileId = ${JSON.stringify(defaultActiveId)};
  let selectedProfileId = activeProfileId;
  let activeTab = 'profiles'; // 'profiles' | 'simulator' | 'pac' | 'backup'
  let isDarkMode = true;

  // DOM Elements
  const sidebarListEl = document.getElementById('sidebar-profiles-list');
  const activeProfileSelectEl = document.getElementById('header-active-profile-select');
  const profilesViewEl = document.getElementById('tab-view-profiles');
  const simulatorViewEl = document.getElementById('tab-view-simulator');
  const pacViewEl = document.getElementById('tab-view-pac');
  const backupViewEl = document.getElementById('tab-view-backup');
  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toast-msg');

  // Utility: Pure ASCII check
  function toPureAscii(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[^\\x00-\\x7F]/g, '');
  }

  // Show Toast
  function showToast(msg) {
    toastMsgEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // Load state from chrome.storage.local
  async function loadState() {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(['profiles', 'activeProfileId', 'theme']);
      if (res.profiles && Array.isArray(res.profiles)) {
        profiles = res.profiles;
      }
      if (res.activeProfileId) {
        activeProfileId = res.activeProfileId;
        selectedProfileId = activeProfileId;
      }
      if (res.theme) {
        setTheme(res.theme === 'dark');
      }
    }
    renderSidebar();
    renderHeaderSelect();
    renderCurrentTab();
  }

  // Save state to chrome.storage.local and background worker
  async function saveState(andApply = false) {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        profiles: profiles,
        activeProfileId: activeProfileId
      });
      if (andApply) {
        chrome.runtime.sendMessage({
          type: 'SWITCH_PROFILE',
          profileId: activeProfileId
        }, () => {
          showToast('代理设置已保存并立即生效！(端口: 7897)');
        });
      } else {
        showToast('配置已保存到本地存储！');
      }
    } else {
      showToast('设置已更新 (本地预览模式)');
    }
    renderSidebar();
    renderHeaderSelect();
    renderCurrentTab();
  }

  // Theme Toggle
  function setTheme(dark) {
    isDarkMode = dark;
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: dark ? 'dark' : 'light' });
    }
  }

  document.getElementById('btn-theme-toggle').onclick = () => {
    setTheme(!isDarkMode);
  };

  // Tab Switching
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      renderCurrentTab();
    };
  });

  function renderCurrentTab() {
    profilesViewEl.style.display = activeTab === 'profiles' ? 'block' : 'none';
    simulatorViewEl.style.display = activeTab === 'simulator' ? 'block' : 'none';
    pacViewEl.style.display = activeTab === 'pac' ? 'block' : 'none';
    backupViewEl.style.display = activeTab === 'backup' ? 'block' : 'none';

    if (activeTab === 'profiles') renderProfileEditor();
    if (activeTab === 'simulator') renderSimulator();
    if (activeTab === 'pac') renderPacViewer();
    if (activeTab === 'backup') renderBackupView();
  }

  // Render Sidebar
  function renderSidebar() {
    sidebarListEl.innerHTML = '';
    profiles.forEach(p => {
      const item = document.createElement('div');
      item.className = 'profile-nav-item' + (p.id === selectedProfileId ? ' active' : '');
      
      let badgeLabel = '代理';
      if (p.profileType === 'DirectProfile') badgeLabel = '直连';
      if (p.profileType === 'SystemProfile') badgeLabel = '系统';
      if (p.profileType === 'SwitchProfile') badgeLabel = '自动切换 •';
      if (p.profileType === 'PacProfile') badgeLabel = 'PAC';

      item.innerHTML = \`
        <div class="profile-item-left">
          <span class="profile-dot" style="background:\${p.color || '#3b82f6'};"></span>
          <span class="profile-item-name">\${p.name}</span>
        </div>
        <span class="profile-item-badge">\${badgeLabel}</span>
      \`;

      item.onclick = () => {
        selectedProfileId = p.id;
        activeTab = 'profiles';
        document.querySelectorAll('.nav-tab-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === 'profiles');
        });
        renderSidebar();
        renderCurrentTab();
      };

      sidebarListEl.appendChild(item);
    });
  }

  // Render Header Active Profile Dropdown
  function renderHeaderSelect() {
    activeProfileSelectEl.innerHTML = '';
    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = (p.id === activeProfileId ? '● ' : '') + p.name;
      opt.selected = p.id === activeProfileId;
      activeProfileSelectEl.appendChild(opt);
    });
    activeProfileSelectEl.onchange = (e) => {
      activeProfileId = e.target.value;
      saveState(true);
    };
  }

  // Format PAC return instruction
  function formatPacStatement(prof) {
    if (!prof) return 'DIRECT';
    if (prof.profileType === 'DirectProfile') return 'DIRECT';
    if (prof.profileType === 'SystemProfile') return 'SYSTEM';
    if (prof.profileType === 'FixedProfile' && prof.fallbackProxy) {
      const p = prof.fallbackProxy;
      const host = toPureAscii(p.host || '127.0.0.1');
      const port = p.port || 7897;
      const scheme = (p.scheme || 'socks5').toLowerCase();
      if (scheme === 'socks5') return 'SOCKS5 ' + host + ':' + port + '; DIRECT';
      if (scheme === 'socks4') return 'SOCKS ' + host + ':' + port + '; DIRECT';
      if (scheme === 'https') return 'HTTPS ' + host + ':' + port + '; DIRECT';
      return 'PROXY ' + host + ':' + port + '; DIRECT';
    }
    return 'DIRECT';
  }

  // Generate 100% Pure ASCII PAC Script
  function generatePacScript(target, allProfiles) {
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
      return '// ProxyPilot PAC Script - Fixed Proxy\\nfunction FindProxyForURL(url, host) {\\n  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost") return "DIRECT";\\n  return "' + ret + '";\\n}';
    }
    if (target.profileType === 'SwitchProfile') {
      const sw = target;
      const defProf = allProfiles.find(p => p.id === sw.defaultProfileId) || allProfiles.find(p => p.id === 'direct');
      const defRet = formatPacStatement(defProf);

      const ruleLines = (sw.rules || []).filter(r => r.enabled).map((r, i) => {
        const tProf = allProfiles.find(p => p.id === r.profileId);
        const tRet = formatPacStatement(tProf);
        const cleanPat = toPureAscii(r.pattern);
        if (r.conditionType === 'HostWildcardCondition') {
          return '  // Rule ' + (i+1) + '\\n  if (shExpMatch(host, "' + cleanPat + '")) return "' + tRet + '";';
        }
        if (r.conditionType === 'HostRegexCondition') {
          return '  // Rule ' + (i+1) + '\\n  if (/' + cleanPat + '/i.test(host)) return "' + tRet + '";';
        }
        return '  if (shExpMatch(url, "' + cleanPat + '")) return "' + tRet + '";';
      });

      return '// ProxyPilot PAC Script - Auto Switch\\nfunction FindProxyForURL(url, host) {\\n  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1") {\\n    return "DIRECT";\\n  }\\n\\n' + ruleLines.join('\\n\\n') + '\\n\\n  // Default Fallback\\n  return "' + defRet + '";\\n}';
    }
    return 'function FindProxyForURL(url, host) { return "DIRECT"; }';
  }

  // TAB 1: Profile Editor Renderer
  function renderProfileEditor() {
    const p = profiles.find(item => item.id === selectedProfileId) || profiles[0];
    if (!p) return;

    if (p.profileType === 'SwitchProfile') {
      renderSwitchProfileEditor(p);
    } else if (p.profileType === 'FixedProfile') {
      renderFixedProfileEditor(p);
    } else if (p.profileType === 'PacProfile') {
      renderPacProfileEditor(p);
    } else {
      renderSimpleProfileEditor(p);
    }
  }

  // SwitchProfile Editor (Matches AI Studio screenshot 2)
  function renderSwitchProfileEditor(sw) {
    profilesViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span style="display:inline-block;width:14px;height:14px;background:\${sw.color || '#f59e0b'};border-radius:4px;"></span>
              <span>\${sw.name}</span>
            </div>
            <div class="card-desc">根据请求的网址或域名自动匹配条件，并将网络请求分流至指定的代理或直连通道（按自上而下优先级匹配）。</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-add-presets" class="btn btn-outline" style="color:var(--accent-orange);border-color:var(--accent-orange);">
              + 添加常用预设域名
            </button>
            <button id="btn-delete-profile" class="btn btn-danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- Switch Rules Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            分流规则列表 (Switch Rules)
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:var(--bg-card-subtle);color:var(--text-muted);font-weight:normal;">\${(sw.rules || []).length} 条已配置规则</span>
          </div>
          <button id="btn-add-rule" class="btn btn-primary">
            + 添加条件
          </button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width:40px;text-align:center;">状态</th>
                <th style="width:140px;">条件类型</th>
                <th>匹配模式 (Pattern)</th>
                <th style="width:180px;">目标情景模式</th>
                <th style="width:160px;">备注</th>
                <th style="width:80px;text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody id="rules-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Online Rule List (GFWList) Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            规则列表规则 (Online Rule List / GFWList)
          </div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;cursor:pointer;">
            <input type="checkbox" id="rulelist-enabled" \${sw.ruleListConfig && sw.ruleListConfig.enabled ? 'checked' : ''}>
            启用在线规则列表
          </label>
        </div>

        <div style="display:grid;grid-template-columns:1fr 180px 180px;gap:12px;margin-bottom:12px;">
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">规则列表 URL (Rule List URL)</label>
            <input type="text" id="rulelist-url" value="\${(sw.ruleListConfig && sw.ruleListConfig.url) || 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt'}">
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">规则列表格式</label>
            <select id="rulelist-format">
              <option value="AutoProxy">AutoProxy (GFWList 格式)</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">命中列表时走的情景模式</label>
            <select id="rulelist-target-profile"></select>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border-color);font-size:11px;color:var(--text-muted);">
          <span>最后更新时间: 2026-10-31 08:00:00</span>
          <div style="display:flex;gap:8px;">
            <button id="btn-sync-rules" class="btn btn-outline" style="font-size:11px;padding:4px 8px;">
              🔄 立即同步更新
            </button>
          </div>
        </div>
      </div>
    \`;

    // Populate Target Profiles for RuleList
    const rlTargetSelect = document.getElementById('rulelist-target-profile');
    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      opt.selected = p.id === (sw.ruleListConfig && sw.ruleListConfig.profileId ? sw.ruleListConfig.profileId : 'proxy_clash');
      rlTargetSelect.appendChild(opt);
    });

    // Populate Rules Table
    const tbody = document.getElementById('rules-tbody');
    (sw.rules || []).forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td style="text-align:center;">
          <input type="checkbox" class="rule-enable-cb" data-idx="\${idx}" \${r.enabled ? 'checked' : ''}>
        </td>
        <td>
          <select class="rule-type-select" data-idx="\${idx}">
            <option value="HostWildcardCondition" \${r.conditionType === 'HostWildcardCondition' ? 'selected' : ''}>域名通配符</option>
            <option value="UrlWildcardCondition" \${r.conditionType === 'UrlWildcardCondition' ? 'selected' : ''}>网址通配符</option>
            <option value="HostRegexCondition" \${r.conditionType === 'HostRegexCondition' ? 'selected' : ''}>域名正则</option>
            <option value="UrlRegexCondition" \${r.conditionType === 'UrlRegexCondition' ? 'selected' : ''}>网址正则</option>
            <option value="KeywordCondition" \${r.conditionType === 'KeywordCondition' ? 'selected' : ''}>关键字</option>
          </select>
        </td>
        <td>
          <input type="text" class="rule-pattern-input mono" data-idx="\${idx}" value="\${r.pattern || ''}">
        </td>
        <td>
          <select class="rule-profile-select" data-idx="\${idx}"></select>
        </td>
        <td>
          <input type="text" class="rule-note-input" data-idx="\${idx}" value="\${r.note || ''}">
        </td>
        <td style="text-align:center;">
          <button class="rule-btn-up icon-btn" data-idx="\${idx}" style="width:24px;height:24px;" title="上移">↑</button>
          <button class="rule-btn-down icon-btn" data-idx="\${idx}" style="width:24px;height:24px;" title="下移">↓</button>
          <button class="rule-btn-del icon-btn btn-danger" data-idx="\${idx}" style="width:24px;height:24px;" title="删除">🗑️</button>
        </td>
      \`;

      // Fill profile select
      const profSelect = tr.querySelector('.rule-profile-select');
      profiles.forEach(pItem => {
        const opt = document.createElement('option');
        opt.value = pItem.id;
        opt.textContent = pItem.name;
        opt.selected = pItem.id === r.profileId;
        profSelect.appendChild(opt);
      });

      tbody.appendChild(tr);
    });

    // Wire Rules Events
    tbody.querySelectorAll('.rule-enable-cb').forEach(cb => {
      cb.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules[i].enabled = e.target.checked;
        saveState();
      };
    });
    tbody.querySelectorAll('.rule-type-select').forEach(sel => {
      sel.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules[i].conditionType = e.target.value;
        saveState();
      };
    });
    tbody.querySelectorAll('.rule-pattern-input').forEach(inp => {
      inp.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules[i].pattern = toPureAscii(e.target.value);
        saveState();
      };
    });
    tbody.querySelectorAll('.rule-profile-select').forEach(sel => {
      sel.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules[i].profileId = e.target.value;
        saveState();
      };
    });
    tbody.querySelectorAll('.rule-note-input').forEach(inp => {
      inp.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules[i].note = e.target.value;
        saveState();
      };
    });
    tbody.querySelectorAll('.rule-btn-up').forEach(btn => {
      btn.onclick = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (i > 0) {
          const temp = sw.rules[i];
          sw.rules[i] = sw.rules[i - 1];
          sw.rules[i - 1] = temp;
          saveState();
          renderProfileEditor();
        }
      };
    });
    tbody.querySelectorAll('.rule-btn-down').forEach(btn => {
      btn.onclick = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (i < sw.rules.length - 1) {
          const temp = sw.rules[i];
          sw.rules[i] = sw.rules[i + 1];
          sw.rules[i + 1] = temp;
          saveState();
          renderProfileEditor();
        }
      };
    });
    tbody.querySelectorAll('.rule-btn-del').forEach(btn => {
      btn.onclick = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        sw.rules.splice(i, 1);
        saveState();
        renderProfileEditor();
      };
    });

    // Add Rule Button
    document.getElementById('btn-add-rule').onclick = () => {
      sw.rules.unshift({
        id: 'rule_' + Date.now(),
        conditionType: 'HostWildcardCondition',
        pattern: '*.example.com',
        profileId: 'proxy_clash',
        enabled: true,
        note: '新条件'
      });
      saveState();
      renderProfileEditor();
    };

    // Add Preset Domains
    document.getElementById('btn-add-presets').onclick = () => {
      const presets = [
        { pattern: '*.google.com', note: 'Google 国际服务' },
        { pattern: '*.github.com', note: 'GitHub 开发者加速' },
        { pattern: '*.youtube.com', note: 'YouTube 媒体' },
        { pattern: '*.openai.com', note: 'OpenAI / ChatGPT' },
        { pattern: '*.wikipedia.org', note: '维基百科' }
      ];
      presets.forEach(pItem => {
        if (!sw.rules.some(r => r.pattern === pItem.pattern)) {
          sw.rules.push({
            id: 'rule_' + Math.random().toString(36).slice(2, 7),
            conditionType: 'HostWildcardCondition',
            pattern: pItem.pattern,
            profileId: 'proxy_clash',
            enabled: true,
            note: pItem.note
          });
        }
      });
      saveState();
      renderProfileEditor();
      showToast('已追加常用预设域名规则！');
    };

    // RuleList Events
    document.getElementById('rulelist-enabled').onchange = (e) => {
      if (!sw.ruleListConfig) sw.ruleListConfig = { enabled: true, url: '', format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
      sw.ruleListConfig.enabled = e.target.checked;
      saveState();
    };
    document.getElementById('rulelist-url').onchange = (e) => {
      if (!sw.ruleListConfig) sw.ruleListConfig = { enabled: true, url: '', format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
      sw.ruleListConfig.url = e.target.value;
      saveState();
    };
    rlTargetSelect.onchange = (e) => {
      if (!sw.ruleListConfig) sw.ruleListConfig = { enabled: true, url: '', format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
      sw.ruleListConfig.profileId = e.target.value;
      saveState();
    };
    document.getElementById('btn-sync-rules').onclick = () => {
      showToast('GFWList 在线规则已同步至最新缓存！');
    };
  }

  // FixedProfile Editor (Proxy 7897)
  function renderFixedProfileEditor(fixed) {
    profilesViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span style="display:inline-block;width:14px;height:14px;background:\${fixed.color || '#10b981'};border-radius:4px;"></span>
              <span>\${fixed.name}</span>
            </div>
            <div class="card-desc">配置标准 HTTP/HTTPS 或 SOCKS5 代理服务器节点，默认使用现代 Clash/Mihomo 端口 7897。</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:120px 1fr 140px;gap:12px;margin-bottom:16px;">
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">代理协议</label>
            <select id="fixed-scheme">
              <option value="socks5" \${fixed.fallbackProxy.scheme === 'socks5' ? 'selected' : ''}>SOCKS5</option>
              <option value="http" \${fixed.fallbackProxy.scheme === 'http' ? 'selected' : ''}>HTTP</option>
              <option value="https" \${fixed.fallbackProxy.scheme === 'https' ? 'selected' : ''}>HTTPS</option>
              <option value="socks4" \${fixed.fallbackProxy.scheme === 'socks4' ? 'selected' : ''}>SOCKS4</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">代理服务器 IP / 主机名</label>
            <input type="text" id="fixed-host" class="mono" value="\${fixed.fallbackProxy.host || '127.0.0.1'}">
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">代理端口 (默认 7897)</label>
            <input type="number" id="fixed-port" class="mono" value="\${fixed.fallbackProxy.port || 7897}">
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button id="btn-fill-7897-socks" class="btn btn-outline" style="font-size:11px;">一键填入 7897 (SOCKS5)</button>
          <button id="btn-fill-7897-http" class="btn btn-outline" style="font-size:11px;">一键填入 7897 (HTTP)</button>
          <button id="btn-fill-1080" class="btn btn-outline" style="font-size:11px;">默认 1080</button>
        </div>

        <!-- Bypass List -->
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">不经过代理连接的主机与域名 (Bypass List)</h4>
        <div class="table-container" style="margin-bottom:12px;">
          <table>
            <thead>
              <tr>
                <th style="width:40px;text-align:center;">启用</th>
                <th>绕过规则 (支持通配符，如 192.168.*, *.local, &lt;local&gt;)</th>
                <th style="width:60px;text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody id="bypass-tbody"></tbody>
          </table>
        </div>
        <button id="btn-add-bypass" class="btn btn-outline" style="font-size:11px;">+ 添加绕过规则</button>
      </div>
    \`;

    // Populate Bypass Rows
    const tbody = document.getElementById('bypass-tbody');
    (fixed.bypassList || []).forEach((b, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td style="text-align:center;">
          <input type="checkbox" class="bypass-cb" data-idx="\${idx}" \${b.enabled ? 'checked' : ''}>
        </td>
        <td>
          <input type="text" class="bypass-pat mono" data-idx="\${idx}" value="\${b.pattern || ''}">
        </td>
        <td style="text-align:center;">
          <button class="bypass-del icon-btn btn-danger" data-idx="\${idx}" style="width:24px;height:24px;">🗑️</button>
        </td>
      \`;
      tbody.appendChild(tr);
    });

    // Wire Events
    document.getElementById('fixed-scheme').onchange = (e) => {
      fixed.fallbackProxy.scheme = e.target.value;
      saveState();
    };
    document.getElementById('fixed-host').onchange = (e) => {
      fixed.fallbackProxy.host = toPureAscii(e.target.value);
      saveState();
    };
    document.getElementById('fixed-port').onchange = (e) => {
      fixed.fallbackProxy.port = parseInt(e.target.value, 10) || 7897;
      saveState();
    };
    document.getElementById('btn-fill-7897-socks').onclick = () => {
      fixed.fallbackProxy.scheme = 'socks5';
      fixed.fallbackProxy.host = '127.0.0.1';
      fixed.fallbackProxy.port = 7897;
      saveState();
      renderProfileEditor();
    };
    document.getElementById('btn-fill-7897-http').onclick = () => {
      fixed.fallbackProxy.scheme = 'http';
      fixed.fallbackProxy.host = '127.0.0.1';
      fixed.fallbackProxy.port = 7897;
      saveState();
      renderProfileEditor();
    };
    document.getElementById('btn-fill-1080').onclick = () => {
      fixed.fallbackProxy.scheme = 'socks5';
      fixed.fallbackProxy.host = '127.0.0.1';
      fixed.fallbackProxy.port = 1080;
      saveState();
      renderProfileEditor();
    };
    tbody.querySelectorAll('.bypass-cb').forEach(cb => {
      cb.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        fixed.bypassList[i].enabled = e.target.checked;
        saveState();
      };
    });
    tbody.querySelectorAll('.bypass-pat').forEach(inp => {
      inp.onchange = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        fixed.bypassList[i].pattern = toPureAscii(e.target.value);
        saveState();
      };
    });
    tbody.querySelectorAll('.bypass-del').forEach(btn => {
      btn.onclick = (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        fixed.bypassList.splice(i, 1);
        saveState();
        renderProfileEditor();
      };
    });
    document.getElementById('btn-add-bypass').onclick = () => {
      if (!fixed.bypassList) fixed.bypassList = [];
      fixed.bypassList.push({ id: 'b_' + Date.now(), pattern: '192.168.*', enabled: true });
      saveState();
      renderProfileEditor();
    };
  }

  // PacProfile Editor
  function renderPacProfileEditor(pacProf) {
    profilesViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span style="display:inline-block;width:14px;height:14px;background:\${pacProf.color || '#ec4899'};border-radius:4px;"></span>
              <span>\${pacProf.name}</span>
            </div>
            <div class="card-desc">通过 JavaScript FindProxyForURL 函数实现极高灵活度的动态代理路由分流。保证为纯 ASCII 编码。</div>
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">PAC 脚本在线地址 (可选)</label>
          <input type="text" id="pac-url" class="mono" value="\${pacProf.pacUrl || ''}">
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">FindProxyForURL 脚本内容 (仅支持 ASCII 字符)</label>
          <textarea id="pac-script-body" class="mono" rows="14">\${pacProf.pacScript || ''}</textarea>
        </div>

        <div style="display:flex;gap:8px;">
          <button id="btn-save-pac" class="btn btn-primary">保存 PAC 脚本</button>
          <button id="btn-reset-pac-7897" class="btn btn-outline">重置为 7897 模版</button>
        </div>
      </div>
    \`;

    document.getElementById('btn-save-pac').onclick = () => {
      const code = document.getElementById('pac-script-body').value;
      pacProf.pacScript = toPureAscii(code);
      pacProf.pacUrl = document.getElementById('pac-url').value;
      saveState();
      showToast('PAC 脚本已保存！');
    };
    document.getElementById('btn-reset-pac-7897').onclick = () => {
      pacProf.pacScript = \`function FindProxyForURL(url, host) {
  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost") return "DIRECT";
  if (shExpMatch(host, "*.google.com") || shExpMatch(host, "*.github.com")) {
    return "SOCKS5 127.0.0.1:7897; DIRECT";
  }
  return "DIRECT";
}\`;
      document.getElementById('pac-script-body').value = pacProf.pacScript;
      saveState();
      showToast('已重置为 7897 标准 PAC 模版');
    };
  }

  // Simple Profile Editor (Direct / System)
  function renderSimpleProfileEditor(p) {
    profilesViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span style="display:inline-block;width:14px;height:14px;background:\${p.color || '#64748b'};border-radius:4px;"></span>
              <span>\${p.name}</span>
            </div>
            <div class="card-desc">\${p.profileType === 'DirectProfile' ? '所有网络连接直接访问目标服务器，不使用任何代理通道。' : '直接使用操作系统在网络设置中配置的系统级代理。'}</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);line-height:1.6;">
          此情景模式为内建基础模式，由浏览器网络底层驱动原生支持。您可以在顶部工具栏或快捷弹窗中快速切换至此模式。
        </p>
      </div>
    \`;
  }

  // TAB 2: Route Simulator Renderer
  function renderSimulator() {
    simulatorViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🎯 实时路由分流模拟器</div>
            <div class="card-desc">输入任意网址或域名，实时模拟请求经过当前生效情景模式的路由路径与最终代理出口。</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input type="text" id="sim-url-input" class="mono" placeholder="https://www.google.com/search?q=test" value="https://www.google.com">
          <button id="btn-run-sim" class="btn btn-primary" style="flex-shrink:0;">测试路由</button>
        </div>

        <div style="display:flex;gap:6px;align-items:center;margin-bottom:16px;">
          <span style="font-size:11px;color:var(--text-muted);">快速测试：</span>
          <button class="sim-chip btn btn-outline" data-u="https://www.google.com" style="font-size:11px;padding:2px 8px;">Google</button>
          <button class="sim-chip btn btn-outline" data-u="https://github.com" style="font-size:11px;padding:2px 8px;">GitHub</button>
          <button class="sim-chip btn btn-outline" data-u="https://www.youtube.com" style="font-size:11px;padding:2px 8px;">YouTube</button>
          <button class="sim-chip btn btn-outline" data-u="http://192.168.1.1" style="font-size:11px;padding:2px 8px;">局域网 192.168</button>
          <button class="sim-chip btn btn-outline" data-u="http://localhost:3000" style="font-size:11px;padding:2px 8px;">Localhost</button>
        </div>

        <!-- Visual Pipeline -->
        <div id="sim-pipeline" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:16px;"></div>

        <!-- Resolution Log -->
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">执行链路追踪详情 (Trace Log)</h4>
        <div id="sim-trace-box" style="background:var(--bg-card-subtle);border:1px solid var(--border-color);border-radius:8px;padding:12px;font-family:monospace;font-size:11px;line-height:1.6;color:var(--text-main);"></div>
      </div>
    \`;

    function executeSimulation(testUrl) {
      const activeProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
      let url = testUrl.trim();
      if (!url.includes('://')) url = 'https://' + url;
      let host = 'unknown';
      try { host = new URL(url).hostname; } catch { host = url; }

      // Trace logic
      const traces = [
        '[1] 解析目标请求: ' + url + ' (主机名: ' + host + ')',
        '[2] 当前生效情景模式: ' + activeProf.name + ' (' + activeProf.profileType + ')'
      ];

      let finalTarget = 'DIRECT';
      let finalSummary = '直接连接 (DIRECT)';

      if (activeProf.profileType === 'DirectProfile') {
        traces.push('[3] 直连模式，直接向目标服务器发起连接');
        finalTarget = 'DIRECT';
        finalSummary = '直接连接 (DIRECT)';
      } else if (activeProf.profileType === 'FixedProfile') {
        const fp = activeProf.fallbackProxy;
        finalTarget = (fp.scheme || 'socks5').toUpperCase() + ' ' + fp.host + ':' + (fp.port || 7897);
        finalSummary = fp.scheme.toUpperCase() + '://' + fp.host + ':' + fp.port;
        traces.push('[3] 通过固定代理节点 ' + finalSummary + ' 进行网络转发');
      } else if (activeProf.profileType === 'SwitchProfile') {
        let matched = false;
        const rules = activeProf.rules || [];
        for (let i = 0; i < rules.length; i++) {
          const r = rules[i];
          if (!r.enabled) continue;
          if (host.includes(r.pattern.replace(/\\*/g, '')) || r.pattern === '<all_urls>') {
            matched = true;
            const targetProf = profiles.find(p => p.id === r.profileId);
            traces.push('[规则命中 #' + (i+1) + '] 匹配模式 "' + r.pattern + '" -> 分流至 "' + (targetProf ? targetProf.name : r.profileId) + '"');
            finalTarget = formatPacStatement(targetProf);
            finalSummary = targetProf ? targetProf.name : '代理通道';
            break;
          }
        }
        if (!matched) {
          traces.push('[默认回退] 自定义规则未命中，回退至默认模式: ' + activeProf.defaultProfileId);
          const defP = profiles.find(p => p.id === activeProf.defaultProfileId);
          finalTarget = formatPacStatement(defP);
          finalSummary = defP ? defP.name : '直连 (DIRECT)';
        }
      }

      traces.push('[最终结果] 目标 "' + host + '" 最终出口: ' + finalSummary + ' (PAC: ' + finalTarget + ')');

      // Update Pipeline DOM
      document.getElementById('sim-pipeline').innerHTML = \`
        <div style="background:var(--bg-card);border:1px solid var(--border-color);padding:12px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">目标主机</div>
          <div style="font-weight:700;font-size:13px;word-break:break-all;">\${host}</div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border-color);padding:12px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">生效模式</div>
          <div style="font-weight:700;font-size:13px;color:var(--accent-orange);">\${activeProf.name}</div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border-color);padding:12px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">最终出口</div>
          <div style="font-weight:700;font-size:13px;color:var(--accent-green);">\${finalSummary}</div>
        </div>
      \`;

      // Update Trace Box
      document.getElementById('sim-trace-box').innerHTML = traces.map(t => '<div>' + t + '</div>').join('');
    }

    document.getElementById('btn-run-sim').onclick = () => {
      executeSimulation(document.getElementById('sim-url-input').value);
    };
    simulatorViewEl.querySelectorAll('.sim-chip').forEach(c => {
      c.onclick = (e) => {
        const u = e.target.dataset.u;
        document.getElementById('sim-url-input').value = u;
        executeSimulation(u);
      };
    });

    executeSimulation('https://www.google.com');
  }

  // TAB 3: PAC Script Generation Renderer
  function renderPacViewer() {
    const activeProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
    const pacScriptText = generatePacScript(activeProf, profiles);

    pacViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📜 PAC 脚本实时生成 (FindProxyForURL)</div>
            <div class="card-desc">针对当前生效模式生成的纯 ASCII 格式 PAC 智能脚本，兼容 Chromium、Firefox 与移动设备。</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-copy-pac" class="btn btn-outline">复制 PAC 脚本</button>
            <button id="btn-download-pac" class="btn btn-primary">下载 proxy.pac</button>
          </div>
        </div>

        <pre style="background:#0b1120;color:#38bdf8;padding:16px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:12px;line-height:1.5;"><code>\${pacScriptText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    \`;

    document.getElementById('btn-copy-pac').onclick = () => {
      navigator.clipboard.writeText(pacScriptText).then(() => {
        showToast('PAC 脚本已成功复制到剪贴板！');
      });
    };
    document.getElementById('btn-download-pac').onclick = () => {
      const blob = new Blob([pacScriptText], { type: 'application/x-ns-proxy-autoconfig' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proxy.pac';
      a.click();
      URL.revokeObjectURL(url);
      showToast('proxy.pac 文件已开始下载');
    };
  }

  // TAB 4: Backup & Presets Renderer
  function renderBackupView() {
    backupViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">💾 备份与预设恢复 (Backup & Restore)</div>
            <div class="card-desc">随时导出配置备份，或一键导入预设方案。</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div style="background:var(--bg-card-subtle);padding:16px;border-radius:8px;">
            <h4 style="font-size:13px;font-weight:700;margin-bottom:6px;">导出备份文件 (.bak.json)</h4>
            <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">包含所有情景模式、端口配置及自动分流规则。</p>
            <button id="btn-export-backup" class="btn btn-primary">导出 JSON 备份</button>
          </div>
          <div style="background:var(--bg-card-subtle);padding:16px;border-radius:8px;">
            <h4 style="font-size:13px;font-weight:700;margin-bottom:6px;">导入备份配置</h4>
            <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">从先前保存的 ProxyPilot 或 SwitchyOmega 备份文件恢复。</p>
            <input type="file" id="file-import-backup" accept=".json,.bak" style="display:none;">
            <button id="btn-trigger-import" class="btn btn-outline">选择文件导入</button>
          </div>
        </div>

        <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;">⚡ 一键应用常用配置预设</h4>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border-color);padding:12px 14px;border-radius:8px;">
            <div>
              <strong style="color:var(--accent-green);">Clash / Mihomo / Sing-box 7897 最佳实践</strong>
              <div style="font-size:11px;color:var(--text-muted);">自动分流规则列表，混合代理端口 127.0.0.1:7897</div>
            </div>
            <button id="btn-preset-clash" class="btn btn-outline" style="font-size:11px;">应用此预设</button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border-color);padding:12px 14px;border-radius:8px;">
            <div>
              <strong style="color:var(--accent-purple);">全栈移动与桌面开发工作流</strong>
              <div style="font-size:11px;color:var(--text-muted);">局域网、Kiwi 移动端、本地开发端口直连，外部资源走 7897</div>
            </div>
            <button id="btn-preset-dev" class="btn btn-outline" style="font-size:11px;">应用此预设</button>
          </div>
        </div>
      </div>
    \`;

    document.getElementById('btn-export-backup').onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'ProxyPilot-Backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      showToast('备份文件已下载！');
    };
    document.getElementById('btn-trigger-import').onclick = () => {
      document.getElementById('file-import-backup').click();
    };
    document.getElementById('file-import-backup').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            profiles = imported;
            saveState(true);
            showToast('已成功导入备份配置！');
          }
        } catch {
          alert('导入失败，文件格式有误。');
        }
      };
      reader.readAsText(file);
    };
    document.getElementById('btn-preset-clash').onclick = () => {
      activeProfileId = 'auto_switch';
      selectedProfileId = 'auto_switch';
      saveState(true);
      showToast('已应用 Clash 7897 最佳实践预设！');
    };
    document.getElementById('btn-preset-dev').onclick = () => {
      activeProfileId = 'proxy_clash';
      selectedProfileId = 'proxy_clash';
      saveState(true);
      showToast('已应用开发工作流预设！');
    };
  }

  // Header Save & Apply Button
  document.getElementById('btn-save-apply').onclick = () => {
    saveState(true);
  };

  // Modals Wiring
  const modalNewProfile = document.getElementById('modal-new-profile');
  const modalHelp = document.getElementById('modal-help');

  document.getElementById('btn-add-profile').onclick = () => {
    modalNewProfile.classList.add('open');
  };
  document.getElementById('btn-cancel-modal').onclick = () => {
    modalNewProfile.classList.remove('open');
  };
  document.getElementById('btn-confirm-new-profile').onclick = () => {
    const name = document.getElementById('new-profile-name').value.trim() || '新情景模式';
    const type = document.getElementById('new-profile-type').value;
    const newId = 'prof_' + Date.now();
    let newProf = {
      id: newId,
      name: name,
      profileType: type,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    if (type === 'FixedProfile') {
      newProf.fallbackProxy = { scheme: 'socks5', host: '127.0.0.1', port: 7897 };
      newProf.bypassList = [{ id: 'b1', pattern: '127.0.0.1', enabled: true }, { id: 'b2', pattern: '<local>', enabled: true }];
    } else if (type === 'SwitchProfile') {
      newProf.rules = [{ id: 'r1', conditionType: 'HostWildcardCondition', pattern: '*.google.com', profileId: 'proxy_clash', enabled: true }];
      newProf.defaultProfileId = 'direct';
    } else if (type === 'PacProfile') {
      newProf.pacScript = 'function FindProxyForURL(url, host) { return "DIRECT"; }';
    }

    profiles.push(newProf);
    selectedProfileId = newId;
    modalNewProfile.classList.remove('open');
    saveState();
    renderSidebar();
    renderCurrentTab();
    showToast('已成功创建情景模式: ' + name);
  };

  document.getElementById('sidebar-btn-backup').onclick = () => {
    activeTab = 'backup';
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === 'backup');
    });
    renderCurrentTab();
  };
  document.getElementById('sidebar-btn-help').onclick = () => {
    modalHelp.classList.add('open');
  };
  document.getElementById('btn-close-help').onclick = () => {
    modalHelp.classList.remove('open');
  };

  // Initialize
  loadState();
})();
`;
}
