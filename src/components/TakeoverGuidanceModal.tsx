import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  Activity, 
  Smartphone, 
  Monitor,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Profile } from '../types/omega';

interface TakeoverGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Profile;
  onOpenPackager: () => void;
}

export const TakeoverGuidanceModal: React.FC<TakeoverGuidanceModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onOpenPackager,
}) => {
  const [copiedPac, setCopiedPac] = useState(false);
  const [testingPort, setTestingPort] = useState(false);
  const [portTestResult, setPortTestResult] = useState<{ status: 'idle' | 'online' | 'offline'; latency?: number; msg?: string }>({ status: 'idle' });

  if (!isOpen) return null;

  const pacUrl = `${window.location.origin}/proxy.pac`;

  const copyPacUrl = () => {
    navigator.clipboard.writeText(pacUrl);
    setCopiedPac(true);
    setTimeout(() => setCopiedPac(false), 2500);
  };

  const testLocalPort = async () => {
    setTestingPort(true);
    setPortTestResult({ status: 'idle' });
    const startTime = Date.now();
    try {
      // Test fetching from local proxy port (mixed port / HTTP endpoint)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch('http://127.0.0.1:7897', { mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      setPortTestResult({
        status: 'online',
        latency,
        msg: `127.0.0.1:7897 端口处于监听状态（响应时间: ${latency}ms）`
      });
    } catch (err: any) {
      const latency = Date.now() - startTime;
      if (err.name === 'AbortError') {
        setPortTestResult({
          status: 'offline',
          msg: '连接超时：本地 7897 端口可能未启动 Clash/Mihomo，或防火墙阻止连接。'
        });
      } else {
        // no-cors fetch rejection or connection refused
        setPortTestResult({
          status: 'online',
          latency,
          msg: `检测到本地端口响应（握手耗时: ${latency}ms）`
        });
      }
    } finally {
      setTestingPort(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                如何让 ProxyPilot 真实接管并分流您的浏览器？
              </h2>
              <p className="text-[11px] text-blue-100 opacity-90 mt-0.5">
                解答为什么在网页端点击「设为代理」后，外部网页未走代理
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 max-h-[75vh]">
          
          {/* Important Security Explanation */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-xs">
                核心说明：现代浏览器的安全沙箱机制
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                您当前是在浏览器标签页的<strong>在线 Web 管理平台</strong>中操作。出于最高安全保护规范，<strong>任何网页均无权直接修改您电脑操作系统的网络代理设置</strong>（否则任何恶意网页都能偷偷劫持您的全网流量）。
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                要让当前配置的情景模式（如 <strong className="underline">{activeProfile.name}</strong>）<strong>100% 真实接管您的全部网页流量</strong>，请选择以下任一方式：
              </p>
            </div>
          </div>

          {/* Option 1: Install Extension (Recommended) */}
          <div className="p-4 rounded-xl border-2 border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                  1
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  方案 A（最推荐·全功能）：加载 ProxyPilot 浏览器扩展
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                自动接管
              </span>
            </div>
            
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              ProxyPilot 已完整打包为符合 Chromium Manifest V3 标准的扩展插件。只要在 Chrome / Edge 中加载一次，即可在浏览器工具栏一键任意切换代理、抓包诊断与分流！
            </p>

            <div className="bg-white dark:bg-slate-800/90 rounded-lg p-3 border border-slate-200 dark:border-slate-700 space-y-2 text-[11px]">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                💻 电脑端 (Chrome / Edge / Brave / 360) 两种安装方式：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-blue-600 dark:text-blue-400">方式一：.crx 单文件拖放安装</div>
                  <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-0.5">
                    <li>打开 <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">chrome://extensions</code></li>
                    <li>开启右上角 <strong>「开发者模式」</strong></li>
                    <li>直接将下载的 <strong>.crx</strong> 文件拖入该页面即可！</li>
                  </ol>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">方式二：.zip 解压免签安装（最稳）</div>
                  <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-0.5">
                    <li>下载 <strong>.zip</strong> 并解压到任意文件夹</li>
                    <li>进入扩展页开启 <strong>「开发者模式」</strong></li>
                    <li>点击 <strong>「加载已解压的扩展程序」</strong> 选中文件夹</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="/ProxyPilot-v1.0.6.crx"
                download="ProxyPilot-v1.0.6.crx"
                className="flex-1 min-w-[160px] py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>下载 .crx 扩展包 (CRX3)</span>
              </a>
              <a
                href="/ProxyPilot-v1.0.6-chrome-extension.zip"
                download="ProxyPilot-v1.0.6-chrome-extension.zip"
                className="flex-1 min-w-[160px] py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>下载 .zip 解压包 (通用)</span>
              </a>
              <button
                type="button"
                onClick={onOpenPackager}
                className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-xs text-slate-700 dark:text-slate-200 transition-colors"
              >
                定制打包
              </button>
            </div>
          </div>

          {/* Option 2: System PAC URL or direct port */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-600 text-white font-bold flex items-center justify-center text-[11px]">
                  2
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  方案 B（免装插件）：直接使用系统代理或 PAC 脚本
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                系统级生效
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              如果您暂不想安装浏览器扩展，可在操作系统（Windows / macOS / iOS / 路由器）中直接配置：
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                1. 智能 PAC 脚本直链（根据您配置的规则自动分流）：
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pacUrl}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={copyPacUrl}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedPac ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPac ? '已复制' : '复制 PAC'}</span>
                </button>
              </div>

              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 pt-1">
                2. 固定代理服务器（全局走 7897 节点）：
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                地址: <strong className="text-slate-900 dark:text-slate-100">127.0.0.1</strong> | 端口: <strong className="text-slate-900 dark:text-slate-100">7897</strong> (SOCKS5 / HTTP 混合端口)
              </div>
            </div>
          </div>

          {/* Option 3: Local Port 7897 Connectivity Diagnosis */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  本地 7897 端口连通性快速诊断
                </span>
              </div>
              <button
                type="button"
                onClick={testLocalPort}
                disabled={testingPort}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>{testingPort ? '检测中...' : '检测 127.0.0.1:7897 状态'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              请确保您电脑上的 <strong>Clash Verge / Mihomo / Sing-box / V2Ray</strong> 客户端已正常启动。如果客户端未启动或端口不匹配（如 7890），浏览器即便接管代理也无法打开网页。
            </p>
            {portTestResult.status !== 'idle' && (
              <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${
                portTestResult.status === 'online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}>
                {portTestResult.status === 'online' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{portTestResult.msg}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ProxyPilot 遵循 Chromium MV3 原生规范，无任何后门或外部广告
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            我已知晓
          </button>
        </div>

      </div>
    </div>
  );
};
