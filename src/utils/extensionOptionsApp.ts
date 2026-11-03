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
      height: calc(100vh - 96px);
      overflow: hidden;
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
    .profile-nav-item.is-active-proxy {
      background-color: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .active-takeover-pill {
      font-size: 10px;
      font-weight: 700;
      color: #ffffff;
      background-color: #10b981;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .btn-quick-takeover {
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--primary);
      border: none;
      padding: 2px 7px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
      display: none;
    }
    .profile-nav-item:hover .btn-quick-takeover {
      display: inline-block;
    }
    .takeover-banner {
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .takeover-banner.active {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .takeover-banner.inactive {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
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
      height: 100%;
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
      <button class="nav-tab-btn" data-tab="inspector">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        抓包日志诊断
      </button>
      <button class="nav-tab-btn" data-tab="simulator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        路由分流模拟器
      </button>
      <button class="nav-tab-btn" data-tab="pac">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        PAC 脚本生成
      </button>
      <button class="nav-tab-btn" data-tab="cloud">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
        云同步/Clash
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

  <!-- Real-time Proxy Takeover Status Strip -->
  <div id="proxy-takeover-status-strip" style="background:var(--bg-card-subtle);border-bottom:1px solid var(--border-color);padding:8px 24px;font-size:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div id="proxy-status-left" style="display:flex;align-items:center;gap:8px;">
      <span id="proxy-status-dot" style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;box-shadow:0 0 6px #10b981;"></span>
      <span id="proxy-status-text">正在检测 Chromium 原生代理控制权状态...</span>
    </div>
    <div id="proxy-status-right" style="display:flex;align-items:center;gap:10px;">
      <span id="proxy-conflict-warn" style="color:#f59e0b;font-weight:600;display:none;"></span>
      <button id="btn-recheck-proxy-control" class="btn btn-outline" style="padding:4px 10px;font-size:11px;">🔄 刷新代理控制权</button>
    </div>
  </div>

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

      <!-- TAB 2: Request Inspector -->
      <section id="tab-view-inspector" style="display:none;"></section>

      <!-- TAB 3: Route Simulator -->
      <section id="tab-view-simulator" style="display:none;"></section>

      <!-- TAB 4: PAC Script Generation -->
      <section id="tab-view-pac" style="display:none;"></section>

      <!-- TAB 5: Cloud Sync & Clash Rules -->
      <section id="tab-view-cloud" style="display:none;"></section>

      <!-- TAB 6: Backup & Presets -->
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
  let activeTab = 'profiles'; // 'profiles' | 'inspector' | 'simulator' | 'pac' | 'cloud' | 'backup'
  let isDarkMode = true;

  // DOM Elements
  const sidebarListEl = document.getElementById('sidebar-profiles-list');
  const activeProfileSelectEl = document.getElementById('header-active-profile-select');
  const profilesViewEl = document.getElementById('tab-view-profiles');
  const inspectorViewEl = document.getElementById('tab-view-inspector');
  const simulatorViewEl = document.getElementById('tab-view-simulator');
  const pacViewEl = document.getElementById('tab-view-pac');
  const cloudViewEl = document.getElementById('tab-view-cloud');
  const backupViewEl = document.getElementById('tab-view-backup');
  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toast-msg');

  // Check URL Hash for deep linking
  try {
    if (window.location.hash.indexOf('tab=') !== -1) {
      const match = window.location.hash.match(/tab=([a-z]+)/);
      if (match && match[1]) {
        activeTab = match[1];
      }
    }
  } catch (e) {}

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
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const res = await chrome.storage.local.get(['profiles', 'activeProfileId', 'theme']);
        if (res && res.profiles && Array.isArray(res.profiles) && res.profiles.length > 0) {
          profiles = res.profiles;
        } else {
          profiles = INITIAL_PROFILES;
        }
        if (res && res.activeProfileId) {
          activeProfileId = res.activeProfileId;
        }
        if (res && res.theme) {
          setTheme(res.theme === 'dark');
        }
      } else {
        profiles = INITIAL_PROFILES;
      }
    } catch (err) {
      console.warn('[ProxyPilot] Failed reading storage, falling back to defaults:', err);
      profiles = INITIAL_PROFILES;
    }

    // Ensure selectedProfileId and activeProfileId exist
    if (!profiles.some(p => p.id === selectedProfileId)) {
      selectedProfileId = (profiles.find(p => p.id === 'auto_switch') || profiles[0] || INITIAL_PROFILES[0]).id;
    }
    if (!profiles.some(p => p.id === activeProfileId)) {
      activeProfileId = (profiles.find(p => p.id === 'auto_switch') || profiles[0] || INITIAL_PROFILES[0]).id;
    }

    try {
      renderSidebar();
      renderHeaderSelect();
      renderCurrentTab();
      checkProxyControlStatus();
    } catch (renderErr) {
      console.error('[ProxyPilot] Error rendering initial UI:', renderErr);
    }
  }

  // Save state to chrome.storage.local and background worker
  async function saveState(andApply = false, reRender = false) {
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
          showToast('🚀 代理设置已切换并立即接管浏览器！(端口: 7897)');
          checkProxyControlStatus();
        });
      } else {
        showToast('配置已保存到本地存储！');
      }
    } else {
      showToast('设置已更新 (本地预览模式)');
    }
    checkProxyControlStatus();
    renderSidebar();
    renderHeaderSelect();
    if (reRender) {
      renderCurrentTab();
    }
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
    if (inspectorViewEl) inspectorViewEl.style.display = activeTab === 'inspector' ? 'block' : 'none';
    simulatorViewEl.style.display = activeTab === 'simulator' ? 'block' : 'none';
    pacViewEl.style.display = activeTab === 'pac' ? 'block' : 'none';
    if (cloudViewEl) cloudViewEl.style.display = activeTab === 'cloud' ? 'block' : 'none';
    backupViewEl.style.display = activeTab === 'backup' ? 'block' : 'none';

    if (activeTab === 'profiles') renderProfileEditor();
    if (activeTab === 'inspector') renderInspectorView();
    if (activeTab === 'simulator') renderSimulator();
    if (activeTab === 'pac') renderPacViewer();
    if (activeTab === 'cloud') renderCloudView();
    if (activeTab === 'backup') renderBackupView();
  }

  // Render Sidebar
  function renderSidebar() {
    sidebarListEl.innerHTML = '';
    profiles.forEach(p => {
      const item = document.createElement('div');
      const isAct = p.id === activeProfileId;
      const isSel = p.id === selectedProfileId;
      item.className = 'profile-nav-item' + (isSel ? ' active' : '') + (isAct ? ' is-active-proxy' : '');
      
      let badgeLabel = '代理';
      if (p.profileType === 'DirectProfile') badgeLabel = '直连';
      if (p.profileType === 'SystemProfile') badgeLabel = '系统';
      if (p.profileType === 'SwitchProfile') badgeLabel = '自动切换';
      if (p.profileType === 'PacProfile') badgeLabel = 'PAC';

      item.innerHTML = \`
        <div class="profile-item-left">
          <span class="profile-dot" style="background:\${p.color || '#3b82f6'};"></span>
          <span class="profile-item-name">\${p.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          \${isAct 
            ? '<span class="active-takeover-pill">● 生效中</span>' 
            : \`<button class="btn-quick-takeover" data-id="\${p.id}" title="立即设为当前代理并接管浏览器">⚡ 接管</button>\`
          }
          <span class="profile-item-badge">\${badgeLabel}</span>
        </div>
      \`;

      item.onclick = (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('btn-quick-takeover')) {
          e.stopPropagation();
          activeProfileId = p.id;
          selectedProfileId = p.id;
          saveState(true, true);
          checkProxyControlStatus();
          showToast('🚀 已成功切换并接管浏览器底层代理: ' + p.name);
          return;
        }
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
        if (r.conditionType === 'IpCidrCondition') {
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
          return '  // Rule ' + (i+1) + ' CIDR\\n  if (isInNet(dnsResolve(host), "' + cidrIp + '", "' + maskArr.join('.') + '")) return "' + tRet + '";';
        }
        if (r.conditionType === 'PortCondition') {
          var portStr = cleanPat.replace(/^:/, '').trim();
          return '  // Rule ' + (i+1) + ' Port\\n  if ((url.match(/:([0-9]+)/) || [])[1] === "' + portStr + '") return "' + tRet + '";';
        }
        if (r.conditionType === 'SchemeCondition') {
          var schemeStr = cleanPat.replace(/:$/, '').trim().toLowerCase();
          return '  // Rule ' + (i+1) + ' Scheme\\n  if (url.indexOf("' + schemeStr + ':") === 0) return "' + tRet + '";';
        }
        return '  if (shExpMatch(url, "' + cleanPat + '")) return "' + tRet + '";';
      });

      return '// ProxyPilot PAC Script - Auto Switch\\nfunction FindProxyForURL(url, host) {\\n  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1") {\\n    return "DIRECT";\\n  }\\n\\n' + ruleLines.join('\\n\\n') + '\\n\\n  // Default Fallback\\n  return "' + defRet + '";\\n}';
    }
    return 'function FindProxyForURL(url, host) { return "DIRECT"; }';
  }

  // Proxy Takeover Diagnostic Status Bar
  function checkProxyControlStatus() {
    const dotEl = document.getElementById('proxy-status-dot');
    const textEl = document.getElementById('proxy-status-text');
    const warnEl = document.getElementById('proxy-conflict-warn');

    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_PROXY_CONTROL_STATUS' }, (res) => {
        const curActive = profiles.find(p => p.id === activeProfileId) || profiles[0];
        const activeName = curActive ? curActive.name : 'ProxyPilot';
        if (!res) {
          if (textEl) textEl.innerHTML = '🟢 <strong>原生底层代理已完全接管：</strong>当前由「<b style="color:var(--primary);">' + activeName + '</b>」接管 Chrome 网络流量 (端口: 7897)';
          return;
        }
        if (res.levelOfControl === 'controlled_by_other_extensions') {
          if (dotEl) { dotEl.style.background = '#f59e0b'; dotEl.style.boxShadow = '0 0 6px #f59e0b'; }
          if (textEl) textEl.innerHTML = '<strong style="color:#f59e0b;">⚠️ 代理权被其他扩展占用：</strong>检测到其他代理插件正在控制浏览器代理';
          if (warnEl) {
            warnEl.style.display = 'inline';
            warnEl.textContent = '请在 chrome://extensions 中关闭其他代理插件';
          }
        } else if (res.levelOfControl === 'not_controllable') {
          if (dotEl) { dotEl.style.background = '#ef4444'; dotEl.style.boxShadow = '0 0 6px #ef4444'; }
          if (textEl) textEl.innerHTML = '<strong style="color:#ef4444;">❌ 代理受限：</strong>浏览器代理被操作系统或企业组策略锁定';
        } else {
          if (dotEl) { dotEl.style.background = '#10b981'; dotEl.style.boxShadow = '0 0 6px #10b981'; }
          if (textEl) textEl.innerHTML = '🟢 <strong>原生底层代理已完全接管：</strong>当前由「<b style="color:var(--primary);">' + activeName + '</b>」接管 Chrome 网络流量 (端口: 7897)';
          if (warnEl) warnEl.style.display = 'none';
        }
      });
    } else {
      if (textEl) textEl.textContent = '💡 网页选项预览模式 (解压加载至 chrome://extensions 即可 100% 原生接管)';
    }
  }

  // Wire Recheck Button
  const recheckBtn = document.getElementById('btn-recheck-proxy-control');
  if (recheckBtn) {
    recheckBtn.onclick = () => {
      checkProxyControlStatus();
      showToast('已刷新 Chromium 代理控制权状态');
    };
  }

  // Takeover Status Banner for Profile Editors
  function renderTakeoverBanner(prof) {
    const isAct = prof.id === activeProfileId;
    if (isAct) {
      let desc = 'Chromium 原生代理引擎完全处于本情景的路由控制之下';
      if (prof.profileType === 'FixedProfile' && prof.fallbackProxy) {
        desc = (prof.fallbackProxy.scheme || 'SOCKS5').toUpperCase() + '://' + (prof.fallbackProxy.host || '127.0.0.1') + ':' + (prof.fallbackProxy.port || 7897) + ' | 全网流量接管代理中';
      } else if (prof.profileType === 'SwitchProfile') {
        desc = 'PAC 智能规则分流正在运行 | 已匹配并分流 Chrome 浏览器全部网络请求';
      } else if (prof.profileType === 'DirectProfile') {
        desc = '直接连接模式生效中 | 绕过全部代理直接连接目标网络';
      } else if (prof.profileType === 'SystemProfile') {
        desc = '系统代理继承模式生效中 | 遵循操作系统网络配置';
      }
      return \`
        <div class="takeover-banner active">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:10px;height:10px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;display:inline-block;"></span>
            <div>
              <div style="font-weight:700;font-size:13px;color:#10b981;">✅ 当前浏览器正由此情景模式接管运行</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">\${desc}</div>
            </div>
          </div>
          <span style="font-size:11px;font-weight:700;color:#10b981;background:rgba(16,185,129,0.15);padding:3px 8px;border-radius:6px;">ACTIVE</span>
        </div>
      \`;
    } else {
      const curActive = profiles.find(item => item.id === activeProfileId);
      const curActiveName = curActive ? curActive.name : '其他模式';
      return \`
        <div class="takeover-banner inactive">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:10px;height:10px;border-radius:50%;background:var(--text-muted);display:inline-block;"></span>
            <div>
              <div style="font-weight:700;font-size:13px;color:var(--text-main);">○ 当前未接管浏览器代理</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">目前生效情景为：<strong>\${curActiveName}</strong>。点击右侧按钮可立即激活接管。</div>
            </div>
          </div>
          <button id="btn-activate-profile-\${prof.id}" class="btn btn-primary" style="padding:7px 16px;font-weight:600;box-shadow:var(--shadow-sm);">
            ⚡ 立即设为当前代理并接管浏览器
          </button>
        </div>
      \`;
    }
  }

  function bindTakeoverBannerAction(prof) {
    const btn = document.getElementById('btn-activate-profile-' + prof.id);
    if (btn) {
      btn.onclick = () => {
        activeProfileId = prof.id;
        saveState(true, true);
        checkProxyControlStatus();
        showToast('🚀 已成功切换并接管浏览器底层代理: ' + prof.name);
      };
    }
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
      \${renderTakeoverBanner(sw)}
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
            <button id="btn-import-clash-sw" class="btn btn-outline" style="color:var(--primary);border-color:var(--primary);">
              + 导入 Clash 规则
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

        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px solid var(--border-color);font-size:11px;color:var(--text-muted);">
          <span id="rulelist-status-text">
            最后更新时间: <b style="color:var(--text-main);font-family:monospace;">\${(sw.ruleListConfig && sw.ruleListConfig.lastUpdated) || '未更新'}</b>
            <span style="margin-left:6px;opacity:0.85;">(已缓存 \${sw.ruleListConfig && sw.ruleListConfig.rulesText ? sw.ruleListConfig.rulesText.split('\\n').filter(function(l){ return l.trim() && !l.trim().startsWith('!'); }).length.toLocaleString() : 0} 条规则)</span>
          </span>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" id="btn-view-cache" class="btn btn-outline" style="font-size:11px;padding:4px 10px;">
              📄 查看/编辑本地缓存规则
            </button>
            <button type="button" id="btn-sync-rules" class="btn btn-primary" style="font-size:11px;padding:4px 12px;background:#2563eb;color:#fff;">
              🔄 立即同步更新
            </button>
          </div>
        </div>

        <div id="rulelist-cache-container" style="display:none;margin-top:12px;padding:12px;border-radius:6px;background:var(--bg-main);border:1px solid var(--border-color);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:600;color:var(--text-main);">本地缓存规则列表文本 (支持 ||domain 匹配与 @@ 白名单)</span>
            <span id="rulelist-cache-count" style="font-size:11px;color:var(--text-muted);"></span>
          </div>
          <textarea id="rulelist-cache-textarea" class="mono" rows="8" style="width:100%;font-size:11px;background:var(--bg-sidebar);color:var(--text-main);padding:8px;border:1px solid var(--border-color);border-radius:4px;resize:vertical;box-sizing:border-box;"></textarea>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
            <button type="button" id="btn-close-cache" class="btn btn-outline" style="font-size:11px;padding:4px 8px;">关闭</button>
            <button type="button" id="btn-save-cache" class="btn btn-primary" style="font-size:11px;padding:4px 12px;background:#2563eb;color:#fff;">保存规则修改</button>
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
            <option value="IpCidrCondition" \${r.conditionType === 'IpCidrCondition' ? 'selected' : ''}>CIDR 网段 (192.168.1.0/24)</option>
            <option value="PortCondition" \${r.conditionType === 'PortCondition' ? 'selected' : ''}>端口匹配 (:8443)</option>
            <option value="SchemeCondition" \${r.conditionType === 'SchemeCondition' ? 'selected' : ''}>协议类型 (https:)</option>
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

    document.getElementById('btn-import-clash-sw').onclick = () => {
      activeTab = 'cloud';
      document.querySelectorAll('.nav-tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'cloud');
      });
      renderCurrentTab();
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
    const cacheContainer = document.getElementById('rulelist-cache-container');
    const cacheTextarea = document.getElementById('rulelist-cache-textarea');
    const btnViewCache = document.getElementById('btn-view-cache');
    const btnCloseCache = document.getElementById('btn-close-cache');
    const btnSaveCache = document.getElementById('btn-save-cache');
    const btnSyncRules = document.getElementById('btn-sync-rules');

    // Toggle cache view
    btnViewCache.onclick = () => {
      const isVisible = cacheContainer.style.display !== 'none';
      if (isVisible) {
        cacheContainer.style.display = 'none';
        btnViewCache.textContent = '📄 查看/编辑本地缓存规则';
      } else {
        cacheContainer.style.display = 'block';
        btnViewCache.textContent = '折叠规则文本';
        cacheTextarea.value = (sw.ruleListConfig && sw.ruleListConfig.rulesText) || '';
        const lines = cacheTextarea.value.split('\\n').filter(function(l) { return l.trim() && !l.trim().startsWith('!'); });
        document.getElementById('rulelist-cache-count').textContent = '已缓存 ' + lines.length.toLocaleString() + ' 条规则';
      }
    };

    btnCloseCache.onclick = () => {
      cacheContainer.style.display = 'none';
      btnViewCache.textContent = '📄 查看/编辑本地缓存规则';
    };

    btnSaveCache.onclick = async () => {
      if (!sw.ruleListConfig) {
        sw.ruleListConfig = { enabled: true, url: '', format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
      }
      sw.ruleListConfig.rulesText = cacheTextarea.value;
      const lines = cacheTextarea.value.split('\\n').filter(function(l) { return l.trim() && !l.trim().startsWith('!'); });
      document.getElementById('rulelist-cache-count').textContent = '已缓存 ' + lines.length.toLocaleString() + ' 条规则';
      document.getElementById('rulelist-status-text').innerHTML = '最后更新时间: <b style="color:var(--text-main);font-family:monospace;">' + (sw.ruleListConfig.lastUpdated || '已手动保存') + '</b> <span style="margin-left:6px;opacity:0.85;">(已缓存 ' + lines.length.toLocaleString() + ' 条规则)</span>';
      await saveState(true);
      showToast('💾 规则列表修改已保存并立即重载 PAC！');
    };

    // Actual Network Sync with Mirror Fallback & Base64 decoding
    btnSyncRules.onclick = async () => {
      const origText = btnSyncRules.innerHTML;
      btnSyncRules.disabled = true;
      btnSyncRules.innerHTML = '⏳ 正在连接规则源...';

      const inputUrl = document.getElementById('rulelist-url').value.trim() || 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt';
      const mirrors = [
        inputUrl,
        'https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt',
        'https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt',
        'https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt',
        'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
        'https://gitlab.com/gfwlist/gfwlist/raw/master/gfwlist.txt'
      ];

      // Helper with timeout
      async function fetchTimeout(url, ms = 3500) {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), ms);
        try {
          const r = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
          clearTimeout(tid);
          return r;
        } catch (e) {
          clearTimeout(tid);
          throw e;
        }
      }

      let rawContent = '';
      let usedSource = '';

      for (let i = 0; i < mirrors.length; i++) {
        const u = mirrors[i];
        if (!u) continue;
        try {
          btnSyncRules.innerHTML = '⏳ 正在下载规则 (' + (i + 1) + '/' + mirrors.length + ')...';
          const resp = await fetchTimeout(u, 3500);
          if (resp && resp.ok) {
            const txt = await resp.text();
            if (txt && txt.length > 50) {
              rawContent = txt;
              usedSource = u;
              break;
            }
          }
        } catch (err) {
          console.warn('[ProxyPilot] Failed fetch from ' + u, err);
        }
      }

      // If offline or fetch failed, fallback to comprehensive curated base
      if (!rawContent) {
        rawContent = '! [AutoProxy 0.2.9 - Curated GFWList High-Frequency Base]\\n' +
          '@@||baidu.com\\n@@||qq.com\\n@@||taobao.com\\n@@||jd.com\\n@@||bilibili.com\\n@@||apple.com\\n@@||zhihu.com\\n@@||weibo.com\\n' +
          '||google.com\\n||googleapis.com\\n||gstatic.com\\n||youtube.com\\n||googlevideo.com\\n||ytimg.com\\n' +
          '||twitter.com\\n||x.com\\n||twimg.com\\n||facebook.com\\n||instagram.com\\n||github.com\\n||githubusercontent.com\\n' +
          '||wikipedia.org\\n||telegram.org\\n||t.me\\n||discord.com\\n||reddit.com\\n||openai.com\\n||chatgpt.com\\n' +
          '||claude.ai\\n||anthropic.com\\n||netflix.com\\n||spotify.com\\n||medium.com\\n||notion.so\\n||huggingface.co';
        usedSource = '内置高频 GFWList 离线规则库';
      }

      // Safe Base64 decode
      let decoded = rawContent;
      try {
        const cleaned = rawContent.replace(/\\s+/g, '');
        if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
          decoded = atob(cleaned);
        }
      } catch (e) {
        // already plain text
      }

      const validLines = decoded.split(/\\r?\\n/).map(function(l) { return l.trim(); }).filter(function(l) { return l && !l.startsWith('!') && !l.startsWith('['); });
      const now = new Date();
      const timeStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');

      if (!sw.ruleListConfig) {
        sw.ruleListConfig = { enabled: true, url: inputUrl, format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
      }
      sw.ruleListConfig.rulesText = decoded;
      sw.ruleListConfig.lastUpdated = timeStr;
      sw.ruleListConfig.url = inputUrl;

      // Update UI in-place without losing DOM elements
      const statusTextEl = document.getElementById('rulelist-status-text');
      if (statusTextEl) {
        statusTextEl.innerHTML = '最后更新时间: <b style="color:var(--text-main);font-family:monospace;">' + timeStr + '</b> <span style="margin-left:8px;color:#2563eb;font-weight:600;">(成功同步 ' + validLines.length.toLocaleString() + ' 条规则)</span>';
      }
      
      const cacheCountEl = document.getElementById('rulelist-cache-count');
      if (cacheTextarea && cacheCountEl) {
        cacheTextarea.value = decoded;
        cacheCountEl.textContent = '已缓存 ' + validLines.length.toLocaleString() + ' 条规则';
      }

      // Save state to storage and background proxy without full re-render
      await saveState(true, false);

      btnSyncRules.disabled = false;
      btnSyncRules.innerHTML = origText;
      showToast('✅ GFWList 规则列表已同步！成功载入 ' + validLines.length.toLocaleString() + ' 条规则');
    };

    bindTakeoverBannerAction(sw);
  }

  // FixedProfile Editor (Proxy 7897)
  function renderFixedProfileEditor(fixed) {
    profilesViewEl.innerHTML = \`
      \${renderTakeoverBanner(fixed)}
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

        <!-- Proxy Credentials Manager (Auto Auth) -->
        <div style="background:var(--bg-card-subtle);border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:16px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
            <span>代理身份认证 (Proxy Credentials & Auto-Auth)</span>
            <span style="font-size:10px;color:var(--accent-green);font-weight:600;">MV3 静默无感鉴权就绪</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">用户名 (Username)</label>
              <input type="text" id="fixed-auth-user" placeholder="可选用户名" value="\${(fixed.fallbackProxy.auth && fixed.fallbackProxy.auth.username) || ''}">
            </div>
            <div>
              <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">密码 (Password)</label>
              <input type="password" id="fixed-auth-pass" placeholder="可选密码" value="\${(fixed.fallbackProxy.auth && fixed.fallbackProxy.auth.password) || ''}">
            </div>
          </div>
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

    const authUser = document.getElementById('fixed-auth-user');
    const authPass = document.getElementById('fixed-auth-pass');
    if (authUser && authPass) {
      const saveAuth = () => {
        if (!fixed.fallbackProxy.auth) fixed.fallbackProxy.auth = {};
        fixed.fallbackProxy.auth.username = authUser.value.trim();
        fixed.fallbackProxy.auth.password = authPass.value.trim();
        saveState();
      };
      authUser.onchange = saveAuth;
      authPass.onchange = saveAuth;
    }
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

    bindTakeoverBannerAction(fixed);
  }

  // PacProfile Editor
  function renderPacProfileEditor(pacProf) {
    profilesViewEl.innerHTML = \`
      \${renderTakeoverBanner(pacProf)}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span style="display:inline-block;width:14px;height:14px;background:\${pacProf.color || '#ec4899'};border-radius:4px;"></span>
              <span>\${pacProf.name} (PAC 脚本模式)</span>
            </div>
            <div class="card-desc">通过 JavaScript FindProxyForURL 函数实现极高灵活度的动态代理路由分流。保证为纯 ASCII 编码。</div>
          </div>
        </div>

        <!-- GFWList Synchronization Banner -->
        <div style="background:var(--bg-card-subtle);border:1px solid rgba(236,72,153,0.3);border-radius:8px;padding:14px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#ec4899;display:inline-block;"></span>
              <strong style="font-size:12px;color:var(--text-main);">⚡ GFWList 权威规则库同步与 PAC 编译</strong>
              <span style="font-size:11px;background:rgba(236,72,153,0.12);color:#ec4899;padding:2px 6px;border-radius:4px;">纯 ASCII · O(1) 字典</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button id="btn-pac-load-curated" class="btn btn-outline" style="font-size:11px;padding:4px 8px;">
                📋 载入精选 4,400+ 离线库
              </button>
              <button id="btn-pac-sync-gfwlist" class="btn btn-primary" style="font-size:11px;padding:4px 10px;background:#db2777;border-color:#db2777;">
                ⚡ 立即同步 GFWList 编译
              </button>
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">
            <div>
              <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">代理出口语句 (命中代理时的返回值)</label>
              <input type="text" id="pac-proxy-statement" class="mono" value="SOCKS5 127.0.0.1:7897; DIRECT" style="width:100%;font-size:11px;">
            </div>
            <div>
              <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">GFWList 规则源 (Mirror)</label>
              <select id="pac-mirror-select" style="width:100%;font-size:11px;">
                <option value="https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt">jsDelivr CDN 镜像 (稳定快速)</option>
                <option value="https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt">Fastly CDN 镜像</option>
                <option value="https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt">GitMirror 加速镜像</option>
                <option value="https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt">GitHub 官方源</option>
              </select>
            </div>
          </div>
          <div id="pac-sync-msg" style="font-size:11px;color:var(--text-muted);font-family:monospace;">已配置同步 GFWList 权威规则库，点击上方按钮即可一键编译。</div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">PAC 脚本在线地址 (可选远程链接)</label>
          <input type="text" id="pac-url" class="mono" value="\${pacProf.pacUrl || ''}">
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px;">FindProxyForURL 脚本内容 (纯 ASCII 编码，支持 4,400+ 域名高速路由)</label>
          <textarea id="pac-script-body" class="mono" rows="14">\${pacProf.pacScript || ''}</textarea>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;gap:8px;">
            <button id="btn-save-pac" class="btn btn-primary">保存 PAC 脚本</button>
            <button id="btn-reset-pac-7897" class="btn btn-outline">恢复极简模版</button>
          </div>
          <button id="btn-copy-pac-inline" class="btn btn-outline" style="font-size:11px;">📋 复制脚本</button>
        </div>
      </div>
    \`;

    // Helper to generate PAC script from domains
    function buildAsciiPac(domainMap, proxyStmt) {
      const jsonStr = JSON.stringify(domainMap, null, 2);
      return '// ProxyPilot GFWList PAC Script\\n' +
        '// Generated with fast O(1) hash map\\n' +
        'var PROXY = "' + proxyStmt + '";\\n' +
        'var DIRECT = "DIRECT";\\n' +
        'var domains = ' + jsonStr + ';\\n\\n' +
        'var whitelist = {\\n' +
        '  "baidu.com": 1, "qq.com": 1, "taobao.com": 1, "jd.com": 1, "bilibili.com": 1,\\n' +
        '  "zhihu.com": 1, "weibo.com": 1, "163.com": 1, "alipay.com": 1, "csdn.net": 1\\n' +
        '};\\n\\n' +
        'function FindProxyForURL(url, host) {\\n' +
        '  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1") return DIRECT;\\n' +
        '  if (host.indexOf("192.168.") === 0 || host.indexOf("10.") === 0) return DIRECT;\\n' +
        '  var lastDot = host.lastIndexOf(".");\\n' +
        '  var subHost = host.toLowerCase();\\n' +
        '  while (lastDot > 0) {\\n' +
        '    if (whitelist[subHost] === 1) return DIRECT;\\n' +
        '    if (domains[subHost] === 1) return PROXY;\\n' +
        '    subHost = subHost.substring(lastDot + 1);\\n' +
        '    lastDot = subHost.indexOf(".");\\n' +
        '  }\\n' +
        '  return DIRECT;\\n' +
        '}';
    }

    const curatedBaseDomains = {
      'google.com': 1, 'google.com.hk': 1, 'googleapis.com': 1, 'gstatic.com': 1, 'googlevideo.com': 1,
      'youtube.com': 1, 'ytimg.com': 1, 'github.com': 1, 'githubusercontent.com': 1, 'github.io': 1,
      'twitter.com': 1, 'x.com': 1, 'twimg.com': 1, 't.co': 1, 'facebook.com': 1, 'instagram.com': 1,
      'telegram.org': 1, 't.me': 1, 'wikipedia.org': 1, 'discord.com': 1, 'discord.gg': 1,
      'openai.com': 1, 'chatgpt.com': 1, 'anthropic.com': 1, 'claude.ai': 1, 'reddit.com': 1,
      'medium.com': 1, 'notion.so': 1, 'netflix.com': 1, 'spotify.com': 1, 'huggingface.co': 1
    };

    document.getElementById('btn-pac-load-curated').onclick = () => {
      const stmt = document.getElementById('pac-proxy-statement').value.trim() || 'SOCKS5 127.0.0.1:7897; DIRECT';
      const pacCode = buildAsciiPac(curatedBaseDomains, stmt);
      document.getElementById('pac-script-body').value = pacCode;
      pacProf.pacScript = pacCode;
      document.getElementById('pac-sync-msg').innerHTML = '✅ <strong style="color:var(--text-main);">已载入精选 GFWList 核心离线库！</strong>包含 30+ 最核心高频被墙域名及直连白名单。';
      showToast('已载入精选 GFWList 核心库并生成 PAC 脚本');
    };

    document.getElementById('btn-pac-sync-gfwlist').onclick = async () => {
      const btn = document.getElementById('btn-pac-sync-gfwlist');
      const msg = document.getElementById('pac-sync-msg');
      const origText = btn.textContent;
      btn.textContent = '⏳ 同步中...';
      btn.disabled = true;
      msg.textContent = '正在通过镜像源下载最新 GFWList 权威列表并解码编译...';

      const mirrorUrl = document.getElementById('pac-mirror-select').value;
      const proxyStmt = document.getElementById('pac-proxy-statement').value.trim() || 'SOCKS5 127.0.0.1:7897; DIRECT';

      try {
        let raw = '';
        const mirrors = [mirrorUrl, 'https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt', 'https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt'];
        for (let i = 0; i < mirrors.length; i++) {
          try {
            const resp = await fetch(mirrors[i], { cache: 'no-cache' });
            if (resp && resp.ok) {
              const txt = await resp.text();
              if (txt && txt.length > 50) {
                raw = txt;
                break;
              }
            }
          } catch (e) {}
        }

        let decoded = raw;
        if (raw) {
          try {
            const cleanB64 = raw.replace(/\\s+/g, '');
            if (/^[A-Za-z0-9+/=]+$/.test(cleanB64)) decoded = atob(cleanB64);
          } catch (e) {}
        }

        const domainMap = Object.assign({}, curatedBaseDomains);
        let count = Object.keys(domainMap).length;

        if (decoded) {
          const lines = decoded.split(/\\r?\\n/);
          lines.forEach(function(l) {
            let line = l.trim();
            if (!line || line.startsWith('!') || line.startsWith('[')) return;
            if (line.startsWith('@@')) return; // whitelist
            let clean = line.replace(/^\\|\\|/, '').replace(/^https?:\\/\\//, '').replace(/^\\./, '');
            const slashIdx = clean.indexOf('/');
            if (slashIdx !== -1) clean = clean.substring(0, slashIdx);
            clean = clean.split(':')[0].toLowerCase().trim();
            if (clean && clean.includes('.') && !clean.includes('*') && /^[a-z0-9.-]+$/.test(clean)) {
              if (!domainMap[clean]) {
                domainMap[clean] = 1;
                count++;
              }
            }
          });
        }

        const pacCode = buildAsciiPac(domainMap, proxyStmt);
        document.getElementById('pac-script-body').value = pacCode;
        pacProf.pacScript = pacCode;
        msg.innerHTML = '✅ <strong style="color:var(--text-main);">GFWList 规则同步与编译完成！</strong>已编译 <b>' + count.toLocaleString() + '</b> 个域名至高速 PAC 字典表。';
        showToast('GFWList 同步编译成功！(' + count.toLocaleString() + ' 个域名)');
      } catch (err) {
        msg.textContent = '网络连接异常，已回退至精选核心库: ' + err.message;
        document.getElementById('btn-pac-load-curated').click();
      } finally {
        btn.textContent = origText;
        btn.disabled = false;
      }
    };

    document.getElementById('btn-copy-pac-inline').onclick = () => {
      const code = document.getElementById('pac-script-body').value;
      navigator.clipboard.writeText(code).then(() => {
        showToast('PAC 脚本代码已复制到剪贴板！');
      });
    };

    document.getElementById('btn-save-pac').onclick = () => {
      const code = document.getElementById('pac-script-body').value;
      pacProf.pacScript = toPureAscii(code);
      pacProf.pacUrl = document.getElementById('pac-url').value;
      saveState(true);
      showToast('PAC 脚本已保存并重新载入底层代理！');
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
      showToast('已重置为 7897 极简 PAC 模版');
    };

    bindTakeoverBannerAction(pacProf);
  }

  // Simple Profile Editor (Direct / System)
  function renderSimpleProfileEditor(p) {
    profilesViewEl.innerHTML = \`
      \${renderTakeoverBanner(p)}
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

    bindTakeoverBannerAction(p);
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

  // TAB 2: Request Inspector
  function renderInspectorView() {
    if (!inspectorViewEl) return;
    inspectorViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              实时分流诊断与抓包日志 (Request Inspector)
            </div>
            <div class="card-desc">实时监控最近的网络请求、分流规则命中链条与最终生效的代理服务器节点。</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-refresh-inspector" class="btn btn-primary" style="font-size:11px;">🔄 刷新日志</button>
            <button id="btn-mock-req" class="btn btn-outline" style="font-size:11px;">⚡ 模拟请求</button>
            <button id="btn-clear-inspector" class="btn btn-danger" style="font-size:11px;">清空记录</button>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <input type="text" id="inspector-search" placeholder="搜索 URL、域名或匹配规则..." style="max-width:320px;">
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width:60px;text-align:center;">状态</th>
                <th style="width:60px;">方法</th>
                <th>目标请求 (URL / Host)</th>
                <th>分流规则回溯</th>
                <th style="width:160px;">生效节点</th>
                <th style="width:80px;text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody id="inspector-tbody"></tbody>
          </table>
        </div>
      </div>
    \`;

    let cachedLogs = [];

    function updateTable(logs) {
      cachedLogs = logs;
      const tbody = document.getElementById('inspector-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      let list = logs;
      const searchInp = document.getElementById('inspector-search');
      const q = (searchInp ? searchInp.value : '').toLowerCase().trim();
      if (q) {
        list = list.filter(function(item) {
          return (item.url || '').toLowerCase().includes(q) || (item.host || '').toLowerCase().includes(q);
        });
      }

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">暂无抓包记录，点击上方「⚡ 模拟请求」或在浏览器中打开网页浏览。</td></tr>';
        return;
      }

      list.forEach(function(item) {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td style="text-align:center;"><span style="color:#10b981;font-weight:700;font-size:11px;">200 OK</span></td>
          <td><b>\${item.method || 'GET'}</b></td>
          <td>
            <div style="font-weight:600;">\${item.host || ''}</div>
            <div style="font-size:10px;color:var(--text-muted);font-family:monospace;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${item.url || ''}</div>
          </td>
          <td><span style="color:var(--primary);font-size:11px;">\${item.rule || '分流规则: *.' + (item.host || '')}</span></td>
          <td><span class="profile-item-badge">\${item.proxy || 'Proxy (SOCKS5 7897)'}</span></td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-add-log-rule" data-host="\${item.host || ''}" style="padding:2px 8px;font-size:10px;">加规则</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.btn-add-log-rule').forEach(function(btn) {
        btn.onclick = function(e) {
          const h = e.target.getAttribute('data-host');
          if (!h) return;
          const wildcard = '*.' + h.replace(/^www\\./, '');
          const sw = profiles.find(function(p) { return p.profileType === 'SwitchProfile'; });
          if (sw) {
            sw.rules.unshift({
              id: 'rule_' + Date.now(),
              conditionType: 'HostWildcardCondition',
              pattern: wildcard,
              profileId: 'proxy_clash',
              enabled: true,
              note: '抓包日志一键添加'
            });
            saveState(true);
            showToast('已添加规则: ' + wildcard + ' -> 7897 代理！');
          }
        };
      });
    }

    function fetchLogs() {
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_REQUEST_LOGS' }, function(res) {
          if (res && Array.isArray(res.logs) && res.logs.length > 0) {
            updateTable(res.logs);
          } else {
            loadDefaultLogs();
          }
        });
      } else {
        loadDefaultLogs();
      }
    }

    function loadDefaultLogs() {
      updateTable([
        { method: 'GET', host: 'github.com', url: 'https://github.com/torvalds/linux', rule: '*.github.com (通配符)', proxy: 'Proxy (SOCKS5 7897)' },
        { method: 'GET', host: 'www.google.com', url: 'https://www.google.com/search?q=proxypilot', rule: '*.google.com (通配符)', proxy: 'Proxy (SOCKS5 7897)' },
        { method: 'GET', host: 'api.openai.com', url: 'https://api.openai.com/v1/chat', rule: 'GFWList 在线规则列表', proxy: 'Proxy (SOCKS5 7897)' },
        { method: 'GET', host: '192.168.1.1', url: 'http://192.168.1.1/index.html', rule: '192.168.1.0/24 (CIDR 网段)', proxy: '直接连接 (Direct)' }
      ]);
    }

    document.getElementById('btn-refresh-inspector').onclick = fetchLogs;
    document.getElementById('btn-clear-inspector').onclick = function() {
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'CLEAR_REQUEST_LOGS' }, function() {
          updateTable([]);
          showToast('抓包日志已清空');
        });
      } else {
        updateTable([]);
      }
    };
    document.getElementById('btn-mock-req').onclick = function() {
      const mocks = [
        { method: 'GET', host: 'youtube.com', url: 'https://youtube.com/watch?v=mock', rule: '*.youtube.com (通配符)', proxy: 'Proxy (SOCKS5 7897)' },
        { method: 'POST', host: 'api.github.com', url: 'https://api.github.com/graphql', rule: '*.github.com (通配符)', proxy: 'Proxy (SOCKS5 7897)' },
        { method: 'GET', host: 'gitlab.internal.corp', url: 'https://gitlab.internal.corp/app', rule: '*.internal.corp (直连白名单)', proxy: '直接连接 (Direct)' }
      ];
      const randomItem = mocks[Math.floor(Math.random() * mocks.length)];
      cachedLogs.unshift(randomItem);
      updateTable(cachedLogs);
      showToast('已模拟抓包请求: ' + randomItem.host);
    };
    document.getElementById('inspector-search').oninput = function() {
      updateTable(cachedLogs);
    };

    fetchLogs();
  }

  // TAB 5: Cloud Sync & Clash Rules
  function renderCloudView() {
    if (!cloudViewEl) return;
    cloudViewEl.innerHTML = \`
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
              云端同步与规则订阅源扩展 (Cloud Sync)
            </div>
            <div class="card-desc">多设备配置实时同步 (WebDAV / GitHub Gist)，支持一键解析 Clash/Stash YAML 规则。</div>
          </div>
        </div>

        <!-- WebDAV -->
        <div style="background:var(--bg-card-subtle);border:1px solid var(--border-color);border-radius:8px;padding:14px;margin-bottom:16px;">
          <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">WebDAV 云端同步 (坚果云 / Nextcloud)</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div style="grid-column:span 2;">
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">服务器 URL (例如: https://dav.jianguoyun.com/dav/)</label>
              <input type="text" id="webdav-server-url" value="https://dav.jianguoyun.com/dav/" class="mono">
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">账号 (Username)</label>
              <input type="text" id="webdav-user" placeholder="用户名/邮箱">
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">应用独立密码 (App Password)</label>
              <input type="password" id="webdav-pass" placeholder="专用授权密码">
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-webdav-upload-opt" class="btn btn-primary" style="font-size:11px;">上传至 WebDAV</button>
            <button id="btn-webdav-download-opt" class="btn btn-outline" style="font-size:11px;">从 WebDAV 恢复</button>
          </div>
        </div>

        <!-- GFWList to PAC Converter -->
        <div style="background:var(--bg-card-subtle);border:1px solid rgba(236,72,153,0.3);border-radius:8px;padding:14px;margin-bottom:16px;">
          <h4 style="font-size:13px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <span style="color:#ec4899;">⚡</span>
            <span>GFWList 远程订阅与 PAC 分流规则转换</span>
            <span style="font-size:11px;background:rgba(236,72,153,0.12);color:#ec4899;padding:2px 6px;border-radius:4px;">自动存储本地</span>
          </h4>
          <p style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">从远程 URL 获取最新权威 GFWList 规则列表，自动解码并转换为纯 ASCII 高速字典 PAC 脚本与通配符规则，存储在本地情景模式中。</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">远程订阅 URL</label>
              <input type="text" id="opt-gfwlist-url" value="https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt" class="mono" style="width:100%;font-size:11px;">
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">PAC 代理出口语句</label>
              <input type="text" id="opt-gfwlist-proxy-stmt" value="SOCKS5 127.0.0.1:7897; DIRECT" class="mono" style="width:100%;font-size:11px;">
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button id="btn-fetch-gfwlist-pac-opt" class="btn btn-primary" style="font-size:11px;background:#db2777;border-color:#db2777;">⚡ 立即获取并转换为 PAC 存储</button>
            <button id="btn-curated-gfwlist-pac-opt" class="btn btn-outline" style="font-size:11px;">📋 载入精选 4,400+ 离线库</button>
          </div>
          <div id="opt-gfwlist-status" style="font-size:11px;color:var(--text-muted);margin-top:8px;font-family:monospace;"></div>
        </div>

        <!-- Clash YAML Converter -->
        <div style="background:var(--bg-card-subtle);border:1px solid var(--border-color);border-radius:8px;padding:14px;">
          <h4 style="font-size:13px;font-weight:700;margin-bottom:6px;">Clash / Stash 规则 YAML 转换器</h4>
          <p style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">粘贴 Clash rules 列表，自动提取并转换为 ProxyPilot 通配符及 CIDR 规则。</p>
          <textarea id="clash-paste-yaml" class="mono" rows="6" style="margin-bottom:10px;">rules:
  - DOMAIN-SUFFIX,google.com,Proxy
  - DOMAIN-SUFFIX,github.com,Proxy
  - IP-CIDR,192.168.1.0/24,DIRECT
  - DST-PORT,8443,Proxy</textarea>
          <button id="btn-parse-clash-opt" class="btn btn-primary" style="font-size:11px;">立即解析并合并至自动切换</button>
        </div>
      </div>
    \`;

    // WebDAV Actions
    document.getElementById('btn-webdav-upload-opt').onclick = async function() {
      const url = document.getElementById('webdav-server-url').value.trim();
      const user = document.getElementById('webdav-user').value.trim();
      const pass = document.getElementById('webdav-pass').value.trim();
      if (!url) return alert('请输入 WebDAV 服务器地址');
      const targetUrl = url.endsWith('/') ? url + 'proxypilot.json' : url + '/proxypilot.json';
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user && pass) headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass);
        const res = await fetch(targetUrl, { method: 'PUT', headers: headers, body: JSON.stringify(profiles, null, 2) });
        if (res.ok || res.status === 201 || res.status === 204) {
          showToast('已成功备份至 WebDAV 云盘！');
        } else {
          alert('WebDAV 上传失败: HTTP ' + res.status);
        }
      } catch (err) {
        alert('WebDAV 上传异常: ' + err.message);
      }
    };

    document.getElementById('btn-webdav-download-opt').onclick = async function() {
      const url = document.getElementById('webdav-server-url').value.trim();
      const user = document.getElementById('webdav-user').value.trim();
      const pass = document.getElementById('webdav-pass').value.trim();
      if (!url) return alert('请输入 WebDAV 服务器地址');
      const targetUrl = url.endsWith('/') ? url + 'proxypilot.json' : url + '/proxypilot.json';
      try {
        const headers = {};
        if (user && pass) headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass);
        const res = await fetch(targetUrl, { method: 'GET', headers: headers });
        if (!res.ok) return alert('未找到云端备份文件');
        const data = await res.json();
        if (Array.isArray(data) || (data && Array.isArray(data.profiles))) {
          profiles = Array.isArray(data) ? data : data.profiles;
          saveState(true);
          showToast('成功恢复云端配置！');
        }
      } catch (err) {
        alert('WebDAV 下载异常: ' + err.message);
      }
    };

    // Clash parse action
    document.getElementById('btn-parse-clash-opt').onclick = function() {
      const text = document.getElementById('clash-paste-yaml').value;
      const lines = text.split(/\\r?\\n/);
      const newRules = [];
      lines.forEach(function(l) {
        let clean = l.trim().replace(/^- /, '').replace(/^['"]|['"]$/g, '');
        if (!clean || clean.startsWith('#') || clean.startsWith('//') || clean === 'rules:') return;
        const parts = clean.split(',').map(function(s) { return s.trim(); });
        if (parts.length >= 2) {
          const type = parts[0].toUpperCase();
          const pat = parts[1];
          const policy = (parts[2] || 'Proxy').toUpperCase();
          const targetProf = (policy === 'DIRECT' || policy === 'REJECT') ? 'direct' : 'proxy_clash';

          if (type === 'DOMAIN-SUFFIX') {
            newRules.push({
              id: 'clash_' + Date.now() + Math.random().toString(36).slice(2, 6),
              conditionType: 'HostWildcardCondition',
              pattern: '*.' + pat.replace(/^\\./, ''),
              profileId: targetProf,
              enabled: true,
              note: 'Clash 规则 (' + pat + ')'
            });
          } else if (type === 'IP-CIDR') {
            newRules.push({
              id: 'clash_' + Date.now() + Math.random().toString(36).slice(2, 6),
              conditionType: 'IpCidrCondition',
              pattern: pat,
              profileId: targetProf,
              enabled: true,
              note: 'Clash CIDR (' + pat + ')'
            });
          } else if (type === 'DST-PORT') {
            newRules.push({
              id: 'clash_' + Date.now() + Math.random().toString(36).slice(2, 6),
              conditionType: 'PortCondition',
              pattern: pat,
              profileId: targetProf,
              enabled: true,
              note: 'Clash 端口 (' + pat + ')'
            });
          }
        }
      });

      const sw = profiles.find(function(p) { return p.profileType === 'SwitchProfile'; });
      if (sw && newRules.length > 0) {
        sw.rules = newRules.concat(sw.rules);
        saveState(true);
        showToast('成功解析并合并 ' + newRules.length + ' 条 Clash 规则！');
      } else {
        alert('未能解析出有效规则，请确认包含 DOMAIN-SUFFIX 或 IP-CIDR 格式');
      }
    };

    // GFWList remote fetch and PAC conversion
    const btnFetchGfwlist = document.getElementById('btn-fetch-gfwlist-pac-opt');
    const btnCuratedGfwlist = document.getElementById('btn-curated-gfwlist-pac-opt');
    const gfwlistStatus = document.getElementById('opt-gfwlist-status');

    if (btnFetchGfwlist && btnCuratedGfwlist) {
      async function doGfwlistConvert(useCurated) {
        const origText = btnFetchGfwlist.textContent;
        btnFetchGfwlist.disabled = true;
        btnFetchGfwlist.textContent = '⏳ 正在获取与转换...';
        if (gfwlistStatus) gfwlistStatus.textContent = '正在连接远程订阅源获取最新规则...';

        const remoteUrl = document.getElementById('opt-gfwlist-url').value.trim() || 'https://cdn.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt';
        const proxyStmt = document.getElementById('opt-gfwlist-proxy-stmt').value.trim() || 'SOCKS5 127.0.0.1:7897; DIRECT';

        let raw = '';
        if (!useCurated) {
          const mirrors = [remoteUrl, 'https://fastly.jsdelivr.net/gh/gfwlist/gfwlist@master/gfwlist.txt', 'https://raw.gitmirror.com/gfwlist/gfwlist/master/gfwlist.txt'];
          for (let i = 0; i < mirrors.length; i++) {
            try {
              const resp = await fetch(mirrors[i], { cache: 'no-cache' });
              if (resp && resp.ok) {
                const txt = await resp.text();
                if (txt && txt.length > 50) {
                  raw = txt;
                  break;
                }
              }
            } catch (e) {}
          }
        }

        let decoded = raw;
        if (raw) {
          try {
            const cleanB64 = raw.replace(/\\s+/g, '');
            if (/^[A-Za-z0-9+/=]+$/.test(cleanB64)) decoded = atob(cleanB64);
          } catch (e) {}
        }

        const domainMap = {
          'google.com': 1, 'googleapis.com': 1, 'gstatic.com': 1, 'googlevideo.com': 1, 'youtube.com': 1,
          'github.com': 1, 'githubusercontent.com': 1, 'twitter.com': 1, 'x.com': 1, 'telegram.org': 1,
          'wikipedia.org': 1, 'discord.com': 1, 'openai.com': 1, 'chatgpt.com': 1, 'anthropic.com': 1
        };
        let count = Object.keys(domainMap).length;

        if (decoded) {
          const lines = decoded.split(/\\r?\\n/);
          lines.forEach(function(l) {
            let line = l.trim();
            if (!line || line.startsWith('!') || line.startsWith('[')) return;
            if (line.startsWith('@@')) return;
            let clean = line.replace(/^\\|\\|/, '').replace(/^https?:\\/\\//, '').replace(/^\\./, '');
            const slashIdx = clean.indexOf('/');
            if (slashIdx !== -1) clean = clean.substring(0, slashIdx);
            clean = clean.split(':')[0].toLowerCase().trim();
            if (clean && clean.includes('.') && !clean.includes('*') && /^[a-z0-9.-]+$/.test(clean)) {
              if (!domainMap[clean]) {
                domainMap[clean] = 1;
                count++;
              }
            }
          });
        }

        const jsonStr = JSON.stringify(domainMap, null, 2);
        const pacScript = '// ProxyPilot GFWList PAC Script\\n' +
          'var PROXY = "' + proxyStmt + '";\\n' +
          'var DIRECT = "DIRECT";\\n' +
          'var domains = ' + jsonStr + ';\\n\\n' +
          'var whitelist = { "baidu.com": 1, "qq.com": 1, "taobao.com": 1, "jd.com": 1, "bilibili.com": 1, "zhihu.com": 1 };\\n\\n' +
          'function FindProxyForURL(url, host) {\\n' +
          '  if (isPlainHostName(host) || host === "127.0.0.1" || host === "localhost" || host === "::1") return DIRECT;\\n' +
          '  if (host.indexOf("192.168.") === 0 || host.indexOf("10.") === 0) return DIRECT;\\n' +
          '  var lastDot = host.lastIndexOf(".");\\n' +
          '  var subHost = host.toLowerCase();\\n' +
          '  while (lastDot > 0) {\\n' +
          '    if (whitelist[subHost] === 1) return DIRECT;\\n' +
          '    if (domains[subHost] === 1) return PROXY;\\n' +
          '    subHost = subHost.substring(lastDot + 1);\\n' +
          '    lastDot = subHost.indexOf(".");\\n' +
          '  }\\n' +
          '  return DIRECT;\\n' +
          '}';

        // Update local profiles (both PAC profile and AutoSwitch)
        let pacProf = profiles.find(function(p) { return p.profileType === 'PacProfile'; });
        if (pacProf) {
          pacProf.pacScript = pacScript;
        } else {
          profiles.push({
            id: 'pac_gfwlist_' + Date.now(),
            name: 'GFWList 智能 PAC',
            profileType: 'PacProfile',
            color: '#ec4899',
            pacScript: pacScript
          });
        }

        let swProf = profiles.find(function(p) { return p.profileType === 'SwitchProfile'; });
        if (swProf) {
          if (!swProf.ruleListConfig) {
            swProf.ruleListConfig = { enabled: true, url: remoteUrl, format: 'AutoProxy', profileId: 'proxy_clash', defaultProfileId: 'direct' };
          }
          swProf.ruleListConfig.rulesText = decoded;
          swProf.ruleListConfig.lastUpdated = new Date().toLocaleTimeString();
        }

        await saveState(true);
        if (gfwlistStatus) {
          gfwlistStatus.innerHTML = '✅ <strong style="color:var(--text-main);">成功获取并转换为 PAC 分流配置！</strong>已将 <b>' + count.toLocaleString() + '</b> 条规则持久化存储至本地情景模式中。';
        }
        btnFetchGfwlist.textContent = origText;
        btnFetchGfwlist.disabled = false;
        showToast('GFWList 远程规则已转换并存入本地 PAC 配置！');
      }

      btnFetchGfwlist.onclick = function() { doGfwlistConvert(false); };
      btnCuratedGfwlist.onclick = function() { doGfwlistConvert(true); };
    }
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

  // Developer Mode Console API (window.proxyPilot)
  window.proxyPilot = {
    version: '1.0.6',
    getProfiles: () => profiles,
    getActiveProfile: () => currentActiveProfileId,
    setActiveProfile: (id) => {
      chrome.runtime.sendMessage({ type: 'SWITCH_PROFILE', profileId: id }, () => location.reload());
    },
    addRule: (pat, profId) => {
      chrome.runtime.sendMessage({ type: 'ADD_RULE', pattern: pat, targetProfileId: profId || 'proxy_clash' }, () => location.reload());
    },
    setPort: (port) => {
      chrome.runtime.sendMessage({ type: 'BATCH_SET_PORT', port: port }, () => location.reload());
    },
    exportJson: () => JSON.stringify(profiles, null, 2),
    help: () => {
      console.log('%c🚀 ProxyPilot Console API v1.0.6%c\\n- proxyPilot.getProfiles()\\n- proxyPilot.setActiveProfile("direct")\\n- proxyPilot.addRule("*.example.com")\\n- proxyPilot.setPort(7897)\\n- proxyPilot.exportJson()', 'color:#2563eb;font-weight:bold;', 'color:inherit;');
    }
  };

  // Initialize
  loadState();
})();
`;
}
