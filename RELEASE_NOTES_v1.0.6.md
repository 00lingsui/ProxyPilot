# ProxyPilot v1.0.6 - 现代化智能浏览器代理自动化套件 (Release Notes)

🚀 **ProxyPilot v1.0.6** 正式发布！本版本带来了重磅“杀手级”功能更新，全面升级了网络请求抓包诊断、GFWList 转 PAC 分流编译器、无感代理认证、多维分流条件、标签页临时接管以及跨客户端订阅转换生态。

---

## 🌟 核心新功能与升级亮点

### 1. 🔍 规则与请求网络调试面板 (Request Inspector)
- **实时日志流**：实时监控并记录发出的 HTTP/HTTPS 网络流量。
- **全链路追踪展示**：清晰显示 **请求 URL ➔ 匹配的规则 ➔ 实际命中的情景模式 ➔ 连接状态 (200 / 404 / ERR_PROXY)**。
- **⚡ 一键添加规则 (One-Click Rule Creation)**：在抓包列表中，若发现某个资源加载失败或走了直连，点击“+ 一键加规则”，自动提取目标域名并弹窗加入自动切换规则列表中。
- **多维度筛选**：支持关键词搜索、仅看代理/直连、仅看报错等过滤。

### 2. ⚡ GFWList 远程同步转 PAC 分流器 (CloudSync GFWList -> PAC)
- **多镜像加速获取**：内置 jsDelivr、GitHub Raw、GitLab、FastGit 等多个加速镜像源，支持一键抓取最新 GFWList。
- **智能 AutoProxy 解码**：自动 Base64 解码，解析白名单（`@@`）、域名前缀（`||`）、通配符与正则规则。
- **$O(1)$ 高性能纯 ASCII PAC 生成**：自动生成严格符合 Chromium 规范、纯 ASCII（无中文字符、无破坏性 BOM）的高效 JavaScript 哈希字典 PAC 脚本。
- **灵活的目标存储策略**：
  - 更新至现有 PAC 情景模式
  - 同步扩充到“自动切换 (Auto Switch)”规则列表
  - 双重同步或一键新建专属 GFWList PAC Profile
- **实时沙箱测试**：内置测试沙箱，输入任意域名/URL 即可瞬间测试 PAC 函数返回结果与性能。

### 3. 🔐 代理无感认证 (Proxy 407 Auth Auto-Fill)
- 在编辑情景模式（如 SOCKS5 / HTTP 7897）时，支持直接配置代理用户名与密码。
- 后台基于 Chrome MV3 `chrome.webRequest.onAuthRequired` / `webRequestAuthProvider` 捕获 407 认证请求，静默自动填充回应，告别原生丑陋弹窗。

### 4. 🎯 更丰富的高级分流规则条件
- **CIDR 网段匹配**：支持 `192.168.1.0/24`、`10.0.0.0/8` 等内网及企业专线分流（利用 PAC `isInNet`）。
- **端口规则匹配 (Port Match)**：针对非标准端口（如 `:8443` 或 `:22`）自动走指定代理。
- **请求资源类型 (Resource Type)**：区分 Image, Script, Media, Websocket，优化带宽与大文件流量。
- **URL 关键词匹配 (Keyword Match)**：路径或查询参数包含特定关键字（如 `geotarget=us`）即时分流。

### 5. ⏱️ 快速控制、快捷键与标签页临时接管 (Tab-Level Override)
- **单标签页临时接管**：一键强制当前活动标签走代理 10 分钟或 30 分钟，不影响全局规则。
- **快捷键系统**：
  - `Alt + Shift + X`：循环切换情景模式
  - `Alt + Shift + P`：在“自动切换”与“直接连接”之间无缝切换。

### 6. 🌐 规则生态兼容 (Clash / Surge / Quantumult X)
- 支持导入 Clash YAML 规则集与 Surge Rule-Set 格式，自动转换为 ProxyPilot 规则。

---

## 📦 Release Assets (发布附件文件)

| 文件名 | 类型 | 说明 |
| :--- | :--- | :--- |
| **`ProxyPilot-v1.0.6-chrome-extension.zip`** | Chrome 扩展包 | 包含完整 MV3 核心、后台 Service Worker、Popup 快捷菜单、Options 设置面板的免安装扩展压缩包（Chrome/Edge/Kiwi通用） |
| **`proxy.pac`** | Standalone PAC 脚本 | 纯 ASCII 格式，内置高频 GFWList 与自定义规则，可直接配置在系统网络或路由器 |
| **`source-code.zip` / `source-code.tar.gz`** | 源码归档 | 完整应用工程源代码 |

---

## 💻 快速安装指南

### 1. 桌面浏览器 (Chrome / Edge / Brave / 360极速)
1. 下载 **`ProxyPilot-v1.0.6-chrome-extension.zip`** 并解压至任意文件夹。
2. 打开浏览器扩展程序管理页面：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. 打开页面右上角 **「开发者模式」** 开关。
4. 点击 **「加载已解压的扩展程序」**，选择刚才解压的文件夹即可完成安装！

### 2. 安卓手机 (Kiwi Browser 原生支持)
1. 在手机上打开 **Kiwi Browser**。
2. 菜单 -> **「扩展程序」** -> 开启 **「开发者模式」**。
3. 点击 **「+ (from .zip / .crx / .user.js)」**。
4. 在文件管理器中直接选取下载的 **`ProxyPilot-v1.0.6-chrome-extension.zip`**（**无需解压**，Kiwi 原生秒装）。

---

## 🛠️ GitHub 提交与推送命令

若要推送到您的远程 GitHub 仓库，在终端执行以下命令即可：

```bash
# 1. 如果尚未关联远程仓库，添加 origin (将下方地址替换为您的仓库地址)
git remote add origin https://github.com/<YOUR_GITHUB_USER>/proxypilot.git

# 2. 推送 main 分支及 v1.0.6 Release 标签
git push -u origin main --tags
```
