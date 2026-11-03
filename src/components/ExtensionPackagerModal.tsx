import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FolderArchive, 
  FileCode, 
  CheckCircle
} from 'lucide-react';
import { Profile } from '../types/omega';
import { generateExtensionZip } from '../utils/extensionGenerator';

interface ExtensionPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
}

export const ExtensionPackagerModal: React.FC<ExtensionPackagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeFile, setActiveFile] = useState<string>('manifest.json');

  if (!isOpen) return null;

  const files = [
    { name: 'manifest.json', desc: 'Manifest V3 扩展配置文件 (权限声明与入口)' },
    { name: 'background.js', desc: '后台 Service Worker (chrome.proxy 引擎控制)' },
    { name: 'popup.html', desc: '浏览器工具栏点击弹窗 (快捷切换与一键加规则)' },
    { name: 'popup.js', desc: '弹窗交互与与 background 通信脚本' },
    { name: 'options.html', desc: '扩展完整选项设置页面' },
    { name: 'proxy.pac', desc: '预生成的 FindProxyForURL 智能脚本' },
    { name: 'README.md', desc: 'Chrome/Edge 开发者模式安装说明文档' },
  ];

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zipBlob = await generateExtensionZip(profiles, activeProfileId);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ProxyPilot-Chrome-Extension-v1.0.6.zip';
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FolderArchive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                导出真实浏览器扩展插件 (Chrome / Edge / Firefox MV3)
              </h2>
              <p className="text-xs text-slate-400">
                将当前全部情景模式、规则与 PAC 引擎打包为即装即用的 ProxyPilot 浏览器插件
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Action Banner */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">已就绪的扩展源码包</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-semibold">
                  ZIP ARCHIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg">
                包含完整 Manifest V3 规范文件与后台服务，解压后可在谷歌 Chrome、微软 Edge、Brave 或 Kiwi 浏览器中以开发者模式直接加载使用。
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow shrink-0"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? '正在生成 ZIP 压缩包...' : '一键打包下载 (.zip)'}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>压缩包已成功下载！解压后即可按照下方指南在浏览器中安装。</span>
            </div>
          )}

          {/* Installation Steps Guide for Mobile & Desktop */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              手机端与电脑端安装指南 (Kiwi Browser / Chrome / Edge)
            </h3>

            {/* Mobile Kiwi Browser Highlight Box */}
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">📱 安卓手机端 Kiwi Browser 极速安装 (无需解压)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">推荐</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                <li>打开手机上的 <strong>Kiwi Browser</strong>，点击右上角菜单按钮 <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">⋮</code> 选择 <strong>「扩展程序」(Extensions)</strong>。</li>
                <li>打开右上角 <strong>「开发者模式」(Developer Mode)</strong> 开关。</li>
                <li>点击左上角的 <strong><code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">+ (from .zip / .crx / .user.js)</code></strong> 按钮。</li>
                <li>直接选中刚下载的 <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">.zip</code> 压缩包，Kiwi 原生支持直接加载 ZIP 包！</li>
                <li>安装完成！点击菜单最下方的 ProxyPilot 即可在手机上随意切换代理模式！</li>
              </ol>
            </div>

            {/* Desktop Chrome / Edge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">电脑 1: 解压 ZIP</span>
                <p className="text-slate-600 dark:text-slate-400">
                  将下载的 <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">.zip</code> 解压到本地任意目录。
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">电脑 2: 打开扩展管理</span>
                <p className="text-slate-600 dark:text-slate-400">
                  Chrome 地址栏输入 <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">chrome://extensions</code> 并开启右上角 "开发者模式"。
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">电脑 3: 加载解压程序</span>
                <p className="text-slate-600 dark:text-slate-400">
                  点击 "加载已解压的扩展程序"，选择解压后的目录即可在工具栏使用！
                </p>
              </div>
            </div>
          </div>

          {/* Files List in Package */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              扩展包包含文件清单 ({files.length} 个文件)
            </h3>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs">
              {files.map((file) => (
                <div
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    activeFile === file.name ? 'bg-blue-50/60 dark:bg-blue-950/40 font-medium text-blue-900 dark:text-blue-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCode className={`w-4 h-4 ${activeFile === file.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="font-mono">{file.name}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">{file.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
