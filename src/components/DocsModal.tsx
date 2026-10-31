import React from 'react';
import { X, BookOpen, Shield, CheckCircle } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight">
              ProxyPilot 浏览器插件与代理使用完全手册
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              一、什么是 ProxyPilot？
            </h3>
            <p>
              ProxyPilot 是一款现代高效的浏览器代理管理与规则路由扩展插件工具。基于 Chromium 最新 Manifest V3 架构规范打造，支持直接连接、固定代理服务器（HTTP/HTTPS/SOCKS4/SOCKS5）、智能自动切换规则、GFWList / AutoProxy 在线规则列表同步以及 PAC (Proxy Auto-Config) 脚本。
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              二、通配符与规则匹配语法参考
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 font-mono text-[11px]">
              <div>
                <strong className="text-slate-900 dark:text-white font-sans">1. 域名通配符 (Host Wildcard) - 最常用:</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  <code className="text-blue-600 dark:text-blue-400 font-bold">*.google.com</code> 匹配 <code className="text-slate-800 dark:text-slate-200">google.com</code>, <code className="text-slate-800 dark:text-slate-200">www.google.com</code>, <code className="text-slate-800 dark:text-slate-200">mail.google.com</code> 等全部子域名。
                </p>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white font-sans">2. 网址通配符 (URL Wildcard):</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  <code className="text-blue-600 dark:text-blue-400 font-bold">http*://*.youtube.com/watch*</code> 仅匹配 YouTube 的视频播放页面。
                </p>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white font-sans">3. 正则表达式 (Regex):</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  <code className="text-blue-600 dark:text-blue-400 font-bold">^https?://192\.168\.\d+\.\d+</code> 匹配局域网 IP 地址。
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              三、不代理地址列表 (Bypass List) 语法
            </h3>
            <p>
              当选择固定的代理服务器模式时，可以通过不代理地址列表绕过特定的局域网或内部机器：
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><code className="font-mono font-semibold text-slate-800 dark:text-slate-200">&lt;local&gt;</code>: 匹配任何不带点号的单标签主机名（如 localhost、intranet）。</li>
              <li><code className="font-mono font-semibold text-slate-800 dark:text-slate-200">127.0.0.1, [::1]</code>: 本地回环地址。</li>
              <li><code className="font-mono font-semibold text-slate-800 dark:text-slate-200">192.168.*, 10.*</code>: 局域网段。</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              四、手机端与电脑端插件安装方法
            </h3>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">📱 手机端 (Kiwi Browser / Edge Android):</span>
              <p className="text-emerald-900 dark:text-emerald-200">
                1. 打开安卓 <strong>Kiwi Browser</strong>，菜单点击 <strong>「扩展程序」(Extensions)</strong>。<br/>
                2. 开启右上角 <strong>「开发者模式」</strong>。<br/>
                3. 点击 <strong>「+ (from .zip / .crx / .user.js)」</strong> 并直接选择刚下载的 .zip 压缩包即可安装！无需解压。
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">💻 电脑端 (Chrome / Edge / Firefox):</span>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400 mt-1">
                <li>点击右上角 <strong>"导出浏览器插件 (.zip)"</strong> 并解压至本地目录。</li>
                <li>Chrome 输入 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">chrome://extensions</code> 开启开发者模式。</li>
                <li>点击 <strong>"加载已解压的扩展程序"</strong> 并选择解压后的文件夹即可。</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
