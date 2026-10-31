# ProxyPilot - 现代浏览器智能代理与自动化分流扩展套件

> 一款基于 Chromium Manifest V3 架构打造的现代代理管理扩展与规则路由工具，默认端口 **7897**，致敬经典 SwitchyOmega。

---

## 🌟 核心特性

- 🚀 **全新命名 ProxyPilot**：简洁大气的现代化代理导航与自动化管理工具。
- ⚡ **默认 7897 端口**：全面适配现代 Clash、Mihomo、Sing-box、Clash Verge 等混合代理端口。
- 📱 **多端全平台支持 (桌面 & 手机端)**：
  - 完美适配电脑端 **Google Chrome / Microsoft Edge / Brave / Firefox**。
  - 完美适配安卓移动端 **Kiwi Browser**（免解压直接加载 `.zip` 安装！）。
- 🌓 **深色 / 浅色双主题无缝切换**：遵循 WCAG 对比度设计规范，支持随系统自动匹配或一键手动切换。
- 🔌 **一键导出真实浏览器插件**：内置 MV3 插件打包生成器，一键下载 `.zip` 即装即用。
- 🎯 **强大的情景模式 (Profiles)**：
  - **直接连接 (Direct)** & **系统代理 (System)**
  - **固定代理服务器 (Proxy Profile)**：支持 HTTP / HTTPS / SOCKS4 / SOCKS5，带认证与 Bypass List 不代理名单。
  - **自动切换模式 (Auto Switch)**：支持域名通配符（`*.google.com`）、网址通配符、正则表达式与关键词分流；支持在线规则列表（AutoProxy / GFWList）。
  - **PAC 智能脚本 (PAC Profile)**：动态生成与执行标准 `FindProxyForURL(url, host)` 脚本。
- 🧪 **交互式路由分流模拟器 (Route Simulator)**：
  - 单 URL 请求全链路拓扑追踪（发起 -> 生效情景 -> 规则匹配判定 -> 目标代理出口 -> 延迟预估）。
  - 批量 URL 矩阵压力测试。
- 📦 **兼容备份与恢复**：一键导入与导出 `.bak` JSON 文件，预设 Clash / V2Ray / 移动端工作流。

---

## 📱 安卓手机端 (Kiwi Browser / Edge Android) 安装指南

1. 在手机上安装并打开 **Kiwi Browser**。
2. 点击右上角菜单按钮 `⋮` -> 选择 **「扩展程序」(Extensions)**。
3. 勾选右上角 **「开发者模式」(Developer Mode)** 开关。
4. 点击 **`+ (from .zip / .crx / .user.js)`** 按钮。
5. 选择刚下载的 `ProxyPilot-Chrome-Extension-v1.0.0.zip`（Kiwi 原生支持直接安装 ZIP，**无需解压**！）。
6. 安装完成后，在浏览器菜单中点击 ProxyPilot 即可随时分流或添加规则！

---

## 💻 电脑端 (Chrome / Edge / Firefox) 安装指南

1. **解压此 ZIP 压缩包** 到本地文件夹（例如 `D:\ProxyPilot-Extension`）。
2. 打开浏览器扩展管理页：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. 开启右上角 **"开发者模式"**。
4. 点击 **"加载已解压的扩展程序"**，选择解压出的文件夹即可。

---

## 🛠️ 本地运行开发

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```
