import { SwitchRule, ConditionType, Profile } from '../types/omega';

export interface ClashParseResult {
  rules: SwitchRule[];
  skippedCount: number;
  totalParsed: number;
}

/**
 * Parses Clash/Stash YAML rule syntax into ProxyPilot SwitchRules
 */
export function parseClashRules(
  yamlOrText: string,
  availableProfiles: Profile[],
  defaultProxyProfileId: string = 'proxy_clash',
  defaultDirectProfileId: string = 'direct'
): ClashParseResult {
  const lines = yamlOrText.split(/\r?\n/);
  const rules: SwitchRule[] = [];
  let inRulesSection = false;
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    // Detect 'rules:' section header in full Clash YAML config
    if (line === 'rules:' || line.startsWith('rules:')) {
      inRulesSection = true;
      continue;
    }

    // Detect payload section in rule-provider YAML
    if (line === 'payload:' || line.startsWith('payload:')) {
      inRulesSection = true;
      continue;
    }

    // Strip leading yaml hyphen if present: "- DOMAIN-SUFFIX,google.com,Proxy"
    if (line.startsWith('- ')) {
      line = line.substring(2).trim();
    }

    const parts = line.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    if (parts.length < 2) {
      if (inRulesSection) skipped++;
      continue;
    }

    const ruleType = parts[0].toUpperCase();
    const pattern = parts[1];
    const targetPolicy = (parts[2] || 'Proxy').toUpperCase();

    // Map Clash policy to ProxyPilot Profile ID
    let targetProfileId = defaultProxyProfileId;
    if (targetPolicy === 'DIRECT' || targetPolicy === 'REJECT') {
      targetProfileId = defaultDirectProfileId;
    } else {
      // Find matching profile by name or fallback to default proxy
      const matched = availableProfiles.find(
        p => p.name.toUpperCase().includes(targetPolicy) || p.id.toUpperCase().includes(targetPolicy)
      );
      if (matched) {
        targetProfileId = matched.id;
      }
    }

    let conditionType: ConditionType | null = null;
    let convertedPattern = pattern;

    if (ruleType === 'DOMAIN-SUFFIX') {
      conditionType = 'HostWildcardCondition';
      convertedPattern = pattern.startsWith('.') ? `*${pattern}` : `*.${pattern}`;
    } else if (ruleType === 'DOMAIN') {
      conditionType = 'HostWildcardCondition';
      convertedPattern = pattern;
    } else if (ruleType === 'DOMAIN-KEYWORD') {
      conditionType = 'KeywordCondition';
      convertedPattern = pattern;
    } else if (ruleType === 'IP-CIDR' || ruleType === 'IP-CIDR6') {
      conditionType = 'IpCidrCondition';
      convertedPattern = pattern;
    } else if (ruleType === 'DST-PORT' || ruleType === 'SRC-PORT') {
      conditionType = 'PortCondition';
      convertedPattern = pattern.replace(/^:/, '');
    } else if (ruleType === 'URL-REGEX') {
      conditionType = 'UrlRegexCondition';
      convertedPattern = pattern;
    } else {
      skipped++;
      continue;
    }

    rules.push({
      id: `clash_${Date.now()}_${i}`,
      conditionType,
      pattern: convertedPattern,
      profileId: targetProfileId,
      enabled: true,
      note: `Clash 规则 (${ruleType}: ${pattern} -> ${targetPolicy})`,
    });
  }

  return {
    rules,
    skippedCount: skipped,
    totalParsed: rules.length,
  };
}
