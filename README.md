# ProxyPilot - 现代浏览器智能代理与自动化分流扩展套件

> 一款基于 Chromium Manifest V3 架构打造的现代代理管理扩展与规则路由工具，默认端口 **7897**，致敬经典 SwitchyOmega。

[![Version](https://img.shields.io/badge/version-1.0.6-blue.svg)](https://github.com)
[![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🌟 核心杀手级功能 (v1.0.6)

1. **流量与抓包诊断面板 (Request Inspector)**：
   - 实时记录 Chromium 发出的 HTTP/HTTPS 请求流。
   - 清晰展示：请求 URL ➔ 匹配规则 ➔ 生效情景模式 ➔ 连接状态码。
   - **一键添加规则**：在抓包记录中一键点击，直接提取域名并添加至“自动切换”分流规则中。
2. **GFWList 远程同步转 PAC 分流器 (CloudSync GFWList -> PAC)**：
   - 远程抓取最新 GFWList 规则，自动 Base64 解码并编译成纯 ASCII、$O(1)$ 哈希匹配的紧凑 PAC 脚本。
   - 支持存储为 PAC 情景模式或转换扩充至 SwitchProfile 自动切换规则。
3. **代理无感认证 (Proxy 407 Auto-Fill)**：
   - 支持在固定代理节点保存用户名和密码。
   - 基于 MV3 `chrome.webRequest.onAuthRequired` 静默响应 407 认证，彻底消灭浏览器系统弹窗。
4. **全功能现代分流条件 (Switch Conditions)**：
   - 域名通配符 (`*.google.com`)、网址正则 (`^https?://...`)。
   - **CIDR 网段匹配** (`192.168.1.0/24`、`10.0.0.0/8`)。
   - **端口规则匹配** (`:8443`、`:22`)。
   - **资源类型过滤** (`Image`、`Script`、`Media`、`WebSocket`)。
   - **关键词匹配** (`KeywordCondition`)。
5. **快速控制与快捷键 (Quick Controls & Shortcuts)**：
   - **单标签页临时接管**：针对当前网页临时开启 10 分钟或 30 分钟代理，不破坏全局规则。
   - 快捷键 `Alt+Shift+X`（循环切换模式）、`Alt+Shift+P`（自动切换/直连一键切换）。
6. **多平台通用**：
   - 电脑端：Google Chrome / Microsoft Edge / Brave / 360极速浏览器。
   - 移动端：安卓 Kiwi Browser（直接加载 `.zip` 无需解压！）。

---

## 📱 安卓手机端 (Kiwi Browser / Edge Android) 安装指南

1. 在手机上安装并打开 **Kiwi Browser**。
2. 点击右上角菜单按钮 `⋮` -> 选择 **「扩展程序」(Extensions)**。
3. 勾选右上角 **「开发者模式」(Developer Mode)** 开关。
4. 点击 **`+ (from .zip / .crx / .user.js)`** 按钮。
5. 选择刚下载的 **`ProxyPilot-v1.0.6-chrome-extension.zip`**（Kiwi 原生支持直接安装 ZIP，**无需解压**！）。
6. 安装完成后，在浏览器菜单中点击 ProxyPilot 即可随时分流或添加规则！

---

## 💻 电脑端 (Chrome / Edge / Firefox) 安装指南

1. **解压 `ProxyPilot-v1.0.6-chrome-extension.zip`** 到本地文件夹（例如 `D:\ProxyPilot-Extension`）。
2. 打开浏览器扩展管理页：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. 开启右上角 **"开发者模式"**。
4. 点击 **"加载已解压的扩展程序"**，选择解压出的文件夹即可。

---

## 🛠️ 本地运行与构建

```bash
# 安装依赖
npm install

# 启动本地开发服务 (端口 3000)
npm run dev

# 编译应用并生成 v1.0.6 扩展 ZIP 及 PAC 发布包
npm run build
```

---

## 🚀 推送到 GitHub 与发布 Release

```bash
# 添加远程仓库
git remote add origin https://github.com/<YOUR_USERNAME>/proxypilot.git

# 推送代码及版本标签
git push -u origin main --tags
```
