import { 
  Profile, 
  FixedProfile, 
  SwitchProfile, 
  PacProfile, 
  VirtualProfile,
  SwitchRule, 
  BypassEntry, 
  SimulationResult 
} from '../types/omega';

/**
 * Converts a wildcard string (e.g. *.google.com, *test*) to a RegExp
 */
export function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

/**
 * Checks if a hostname or URL matches a wildcard pattern
 */
export function matchWildcard(pattern: string, target: string): boolean {
  if (pattern === '*' || pattern === '<all_urls>') return true;
  
  // Standard switchy wildcard handling for hostnames like *.google.com
  if (pattern.startsWith('*.')) {
    const rootDomain = pattern.slice(2);
    if (target.toLowerCase() === rootDomain.toLowerCase()) {
      return true;
    }
  }
  
  try {
    const regex = wildcardToRegExp(pattern);
    return regex.test(target);
  } catch {
    return false;
  }
}

/**
 * Checks if a hostname/URL matches bypass pattern
 */
export function matchBypass(pattern: string, host: string, url: string): boolean {
  const trimmed = pattern.trim();
  if (!trimmed) return false;

  // <local> matches plain hostnames with no dots, or localhost
  if (trimmed.toLowerCase() === '<local>') {
    return !host.includes('.') || host === 'localhost';
  }

  // Plain host match
  if (trimmed === host) return true;

  // Wildcard match (e.g., 192.168.*, *.internal)
  if (trimmed.includes('*') || trimmed.includes('?')) {
    return matchWildcard(trimmed, host) || matchWildcard(trimmed, url);
  }

  // CIDR or IP prefix approximation
  if (trimmed.endsWith('.')) {
    return host.startsWith(trimmed);
  }

  return false;
}

/**
 * Parses and tests AutoProxy / GFWList formatted rules
 * e.g.:
 * ||domain.com (matches domain and subdomains)
 * |http://... (starts with)
 * @@||domain.com (whitelist / direct)
 * ! comment
 */
export function matchAutoProxyRule(rulesText: string, host: string, url: string): { matched: boolean; isWhitelist: boolean; matchedLine?: string } {
  const lines = rulesText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('!') && !l.startsWith('['));

  for (const line of lines) {
    let raw = line;
    let isWhitelist = false;

    if (raw.startsWith('@@')) {
      isWhitelist = true;
      raw = raw.slice(2);
    }

    if (raw.startsWith('||')) {
      // Matches domain and all subdomains
      const domain = raw.slice(2).replace(/^\/+/, '');
      if (host === domain || host.endsWith('.' + domain)) {
        return { matched: true, isWhitelist, matchedLine: line };
      }
    } else if (raw.startsWith('|')) {
      // Starts with
      const prefix = raw.slice(1);
      if (url.startsWith(prefix)) {
        return { matched: true, isWhitelist, matchedLine: line };
      }
    } else if (raw.startsWith('/') && raw.endsWith('/') && raw.length > 2) {
      // Regex
      try {
        const re = new RegExp(raw.slice(1, -1), 'i');
        if (re.test(url) || re.test(host)) {
          return { matched: true, isWhitelist, matchedLine: line };
        }
      } catch {
        // ignore regex syntax error in rule list
      }
    } else {
      // Substring match
      if (url.includes(raw) || host.includes(raw)) {
        return { matched: true, isWhitelist, matchedLine: line };
      }
    }
  }

  return { matched: false, isWhitelist: false };
}

/**
 * Formats a proxy into PAC return statement string
 */
export function formatPacStatement(profile: Profile): string {
  if (profile.profileType === 'DirectProfile') {
    return 'DIRECT';
  }
  if (profile.profileType === 'SystemProfile') {
    return 'SYSTEM';
  }
  if (profile.profileType === 'FixedProfile') {
    const fixed = profile as FixedProfile;
    const p = fixed.fallbackProxy;
    if (p.scheme === 'socks5') {
      return `SOCKS5 ${p.host}:${p.port}; SOCKS ${p.host}:${p.port}; DIRECT`;
    }
    if (p.scheme === 'socks4') {
      return `SOCKS ${p.host}:${p.port}; DIRECT`;
    }
    if (p.scheme === 'https') {
      return `HTTPS ${p.host}:${p.port}; DIRECT`;
    }
    return `PROXY ${p.host}:${p.port}; DIRECT`;
  }
  return 'DIRECT';
}

/**
 * Runs a complete simulation of a request against the currently active profile
 */
export function simulateRoute(
  inputUrl: string, 
  activeProfileId: string, 
  profiles: Profile[]
): SimulationResult {
  let normalizedUrl = inputUrl.trim();
  if (!normalizedUrl.includes('://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    parsed = new URL('https://' + encodeURI(normalizedUrl));
  }

  const host = parsed.hostname;
  const protocol = parsed.protocol;
  const port = parsed.port || (protocol === 'https:' ? '443' : '80');
  const pathname = parsed.pathname;

  const trace: string[] = [];
  trace.push(`[1] 请求目标解析: 协议=${protocol}, 主机=${host}, 端口=${port}, 路径=${pathname}`);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  trace.push(`[2] 当前生效情景模式: "${activeProfile.name}" (${activeProfile.profileType})`);

  // Resolution helper
  function resolveProfile(currentProfile: Profile, depth = 0): {
    effective: Profile;
    matchedRule?: SwitchRule;
    matchedRuleList?: boolean;
    matchedBypass?: BypassEntry;
  } {
    if (depth > 10) {
      trace.push(`[警告] 达到最大递归深度，强制回退至直连模式`);
      return { effective: profiles.find(p => p.id === 'direct') || currentProfile };
    }

    if (currentProfile.profileType === 'VirtualProfile') {
      const virt = currentProfile as VirtualProfile;
      const target = profiles.find(p => p.id === virt.targetProfileId);
      trace.push(` -> 虚拟模式 "${virt.name}" 映射至 "${target?.name || '未知'}"`);
      if (target) {
        return resolveProfile(target, depth + 1);
      }
      return { effective: currentProfile };
    }

    if (currentProfile.profileType === 'FixedProfile') {
      const fixed = currentProfile as FixedProfile;
      // Check bypass list
      for (const bp of fixed.bypassList) {
        if (bp.enabled && matchBypass(bp.pattern, host, normalizedUrl)) {
          trace.push(`[Bypass 命中] 规则 "${bp.pattern}" 匹配主机 "${host}" -> 触发直连绕过`);
          const directProf = profiles.find(p => p.id === 'direct') || currentProfile;
          return { effective: directProf, matchedBypass: bp };
        }
      }
      trace.push(`[Proxy 路由] 通过代理服务器 ${fixed.fallbackProxy.scheme.toUpperCase()}://${fixed.fallbackProxy.host}:${fixed.fallbackProxy.port}`);
      return { effective: currentProfile };
    }

    if (currentProfile.profileType === 'SwitchProfile') {
      const switcher = currentProfile as SwitchProfile;
      trace.push(`[自动切换] 开始按顺序匹配切换规则 (共 ${switcher.rules.length} 条自定义规则)...`);

      for (let i = 0; i < switcher.rules.length; i++) {
        const rule = switcher.rules[i];
        if (!rule.enabled) continue;

        let isMatch = false;
        if (rule.conditionType === 'HostWildcardCondition') {
          isMatch = matchWildcard(rule.pattern, host);
        } else if (rule.conditionType === 'UrlWildcardCondition') {
          isMatch = matchWildcard(rule.pattern, normalizedUrl);
        } else if (rule.conditionType === 'HostRegexCondition') {
          try {
            isMatch = new RegExp(rule.pattern, 'i').test(host);
          } catch {
            isMatch = false;
          }
        } else if (rule.conditionType === 'UrlRegexCondition') {
          try {
            isMatch = new RegExp(rule.pattern, 'i').test(normalizedUrl);
          } catch {
            isMatch = false;
          }
        } else if (rule.conditionType === 'KeywordCondition') {
          isMatch = normalizedUrl.includes(rule.pattern) || host.includes(rule.pattern);
        }

        if (isMatch) {
          const targetProf = profiles.find(p => p.id === rule.profileId);
          trace.push(`[规则命中 #${i + 1}] "${rule.pattern}" (${rule.conditionType}) 匹配 -> 路由至 "${targetProf?.name || rule.profileId}"`);
          if (targetProf) {
            return {
              ...resolveProfile(targetProf, depth + 1),
              matchedRule: rule,
            };
          }
        }
      }

      // Check Rule List (e.g. GFWList / AutoProxy)
      const ruleListCfg = switcher.ruleListConfig;
      if (ruleListCfg && ruleListCfg.enabled && ruleListCfg.rulesText) {
        trace.push(`[规则列表] 评估在线规则列表 (${ruleListCfg.format})...`);
        const apMatch = matchAutoProxyRule(ruleListCfg.rulesText, host, normalizedUrl);
        if (apMatch.matched) {
          if (apMatch.isWhitelist) {
            trace.push(`[规则列表白名单] 匹配白名单项 "${apMatch.matchedLine}" -> 路由至直连/默认模式`);
            const defProf = profiles.find(p => p.id === ruleListCfg.defaultProfileId) || profiles.find(p => p.id === 'direct');
            if (defProf) return resolveProfile(defProf, depth + 1);
          } else {
            trace.push(`[规则列表命中] 匹配黑名单项 "${apMatch.matchedLine}" -> 路由至规则列表指定代理 "${ruleListCfg.profileId}"`);
            const ruleListProf = profiles.find(p => p.id === ruleListCfg.profileId);
            if (ruleListProf) {
              return {
                ...resolveProfile(ruleListProf, depth + 1),
                matchedRuleList: true,
              };
            }
          }
        } else {
          trace.push(`[规则列表] 未命中任何列表项`);
        }
      }

      // Fallback
      trace.push(`[默认回退] 所有规则均未匹配，应用自动切换的默认模式 "${switcher.defaultProfileId}"`);
      const fallbackProf = profiles.find(p => p.id === switcher.defaultProfileId) || profiles.find(p => p.id === 'direct');
      if (fallbackProf) {
        return resolveProfile(fallbackProf, depth + 1);
      }
      return { effective: currentProfile };
    }

    if (currentProfile.profileType === 'PacProfile') {
      trace.push(`[PAC 脚本] 执行 PAC FindProxyForURL(url, host)...`);
      return { effective: currentProfile };
    }

    return { effective: currentProfile };
  }

  const { effective, matchedRule, matchedRuleList, matchedBypass } = resolveProfile(activeProfile);

  const isDirect = effective.profileType === 'DirectProfile' || !!matchedBypass;
  const pacStatement = formatPacStatement(effective);

  let finalProxySummary = '';
  if (effective.profileType === 'FixedProfile') {
    const f = effective as FixedProfile;
    finalProxySummary = `${f.fallbackProxy.scheme.toUpperCase()}://${f.fallbackProxy.host}:${f.fallbackProxy.port}`;
  } else if (effective.profileType === 'DirectProfile') {
    finalProxySummary = '直连网络 (DIRECT)';
  } else if (effective.profileType === 'SystemProfile') {
    finalProxySummary = '使用操作系统代理设置 (SYSTEM)';
  } else if (effective.profileType === 'PacProfile') {
    finalProxySummary = '动态 PAC 智能脚本分配';
  } else {
    finalProxySummary = effective.name;
  }

  trace.push(`[最终结果] 目标 "${host}" 路由终点: ${finalProxySummary} (PAC 指令: ${pacStatement})`);

  return {
    url: normalizedUrl,
    parsedUrl: {
      protocol,
      hostname: host,
      port,
      pathname,
    },
    activeProfile,
    effectiveProfile: effective,
    matchedRule,
    matchedRuleList,
    matchedBypass,
    resolutionTrace: trace,
    pacStatement,
    finalProxySummary,
    isDirect,
    latencyMs: isDirect ? Math.floor(Math.random() * 20 + 8) : Math.floor(Math.random() * 60 + 35),
  };
}
