import { SecurityBypassConfig } from '../types/omega';

export const DEFAULT_SECURITY_BYPASS: SecurityBypassConfig = {
  enabled: true,
  bypassGovCn: true,
  bypassEduCn: true,
  bypassBanking: true,
  bypassLocalLan: true,
  customDomains: [
    '*.internal',
    '*.corp',
    '*.lan',
  ],
};

export const PRESET_GOV_DOMAINS = [
  '*.gov.cn',
  '*.mof.gov.cn',
  '*.tax.gov.cn',
  '*.samr.gov.cn',
];

export const PRESET_EDU_DOMAINS = [
  '*.edu.cn',
  '*.tsinghua.edu.cn',
  '*.pku.edu.cn',
  '*.fudan.edu.cn',
  '*.sjtu.edu.cn',
  '*.zju.edu.cn',
];

export const PRESET_BANKING_DOMAINS = [
  '*.icbc.com.cn',
  '*.ccb.com',
  '*.boc.cn',
  '*.bankofchina.com',
  '*.abchina.com',
  '*.cmbchina.com',
  '*.bankcomm.com',
  '*.spdb.com.cn',
  '*.alipay.com',
  '*.95516.com',
  '*.unionpay.com',
  '*.citicbank.com',
];

export const PRESET_LOCAL_LAN = [
  '<local>',
  '127.0.0.1',
  'localhost',
  '::1',
  '10.*',
  '172.16.*',
  '192.168.*',
];

/**
 * Checks if a hostname matches any active security whitelist patterns
 */
export function isDomainSecurityBypassed(
  host: string,
  config: SecurityBypassConfig = DEFAULT_SECURITY_BYPASS
): { bypassed: boolean; matchedReason?: string } {
  if (!config.enabled) return { bypassed: false };

  const cleanHost = host.toLowerCase().trim();

  // 1. Gov.cn
  if (config.bypassGovCn && (cleanHost === 'gov.cn' || cleanHost.endsWith('.gov.cn'))) {
    return { bypassed: true, matchedReason: '政务安全强制直连 (*.gov.cn)' };
  }

  // 2. Edu.cn
  if (config.bypassEduCn && (cleanHost === 'edu.cn' || cleanHost.endsWith('.edu.cn'))) {
    return { bypassed: true, matchedReason: '高校教育科研直连 (*.edu.cn)' };
  }

  // 3. Banking & Finance
  if (config.bypassBanking) {
    for (const bank of PRESET_BANKING_DOMAINS) {
      const root = bank.replace(/^\*\./, '');
      if (cleanHost === root || cleanHost.endsWith('.' + root)) {
        return { bypassed: true, matchedReason: `银行金融隐私保护 (${bank})` };
      }
    }
  }

  // 4. Local LAN
  if (config.bypassLocalLan) {
    if (
      cleanHost === 'localhost' ||
      cleanHost === '127.0.0.1' ||
      cleanHost === '::1' ||
      !cleanHost.includes('.') ||
      cleanHost.startsWith('192.168.') ||
      cleanHost.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanHost)
    ) {
      return { bypassed: true, matchedReason: '局域网/本机地址免代理' };
    }
  }

  // 5. Custom Domains
  if (config.customDomains && config.customDomains.length > 0) {
    for (const pat of config.customDomains) {
      const trimmed = pat.trim().toLowerCase();
      if (!trimmed) continue;
      if (trimmed.startsWith('*.')) {
        const root = trimmed.slice(2);
        if (cleanHost === root || cleanHost.endsWith('.' + root)) {
          return { bypassed: true, matchedReason: `自定义绝对直连 (${trimmed})` };
        }
      } else if (cleanHost === trimmed) {
        return { bypassed: true, matchedReason: `自定义绝对直连 (${trimmed})` };
      }
    }
  }

  return { bypassed: false };
}
