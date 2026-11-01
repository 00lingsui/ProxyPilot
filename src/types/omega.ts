/**
 * SwitchyOmega data types and schemas
 */

export type ProfileType = 
  | 'DirectProfile' 
  | 'SystemProfile' 
  | 'FixedProfile' 
  | 'PacProfile' 
  | 'SwitchProfile' 
  | 'VirtualProfile';

export type ProxyScheme = 'http' | 'https' | 'socks4' | 'socks5';

export interface ProxyServer {
  scheme: ProxyScheme;
  host: string;
  port: number;
  auth?: {
    username?: string;
    password?: string;
  };
}

export interface BypassEntry {
  id: string;
  pattern: string;
  enabled: boolean;
}

export type ConditionType = 
  | 'HostWildcardCondition'
  | 'HostRegexCondition'
  | 'UrlWildcardCondition'
  | 'UrlRegexCondition'
  | 'KeywordCondition'
  | 'BypassCondition'
  | 'IpCidrCondition'
  | 'PortCondition'
  | 'SchemeCondition';

export interface ProxyAuth {
  username?: string;
  password?: string;
  enabled?: boolean;
}

export interface SwitchRule {
  id: string;
  conditionType: ConditionType;
  pattern: string;
  profileId: string;
  enabled: boolean;
  note?: string;
}

export interface RuleListConfig {
  enabled: boolean;
  url: string;
  format: 'AutoProxy' | 'Switchy' | 'Clash';
  profileId: string;
  defaultProfileId: string;
  rulesText?: string;
  lastUpdated?: string;
}

export interface BaseProfile {
  id: string;
  name: string;
  profileType: ProfileType;
  color: string;
  revision?: string;
}

export interface DirectProfile extends BaseProfile {
  profileType: 'DirectProfile';
}

export interface SystemProfile extends BaseProfile {
  profileType: 'SystemProfile';
}

export interface FixedProfile extends BaseProfile {
  profileType: 'FixedProfile';
  fallbackProxy: ProxyServer;
  proxyForHttp?: ProxyServer;
  proxyForHttps?: ProxyServer;
  proxyForFtp?: ProxyServer;
  useSingleProxy: boolean;
  bypassList: BypassEntry[];
  auth?: ProxyAuth;
}

export interface PacProfile extends BaseProfile {
  profileType: 'PacProfile';
  pacUrl?: string;
  pacScript?: string;
}

export interface SwitchProfile extends BaseProfile {
  profileType: 'SwitchProfile';
  rules: SwitchRule[];
  defaultProfileId: string;
  ruleListConfig?: RuleListConfig;
}

export interface VirtualProfile extends BaseProfile {
  profileType: 'VirtualProfile';
  targetProfileId: string;
}

export type Profile = 
  | DirectProfile 
  | SystemProfile 
  | FixedProfile 
  | PacProfile 
  | SwitchProfile 
  | VirtualProfile;

export interface SimulationResult {
  url: string;
  parsedUrl: {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
  };
  activeProfile: Profile;
  effectiveProfile: Profile;
  matchedRule?: SwitchRule;
  matchedRuleList?: boolean;
  matchedBypass?: BypassEntry;
  resolutionTrace: string[];
  pacStatement: string;
  finalProxySummary: string;
  isDirect: boolean;
  latencyMs?: number;
}

export interface RequestLogItem {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  type: string;
  host: string;
  port: string;
  scheme: string;
  matchedRuleDescription?: string;
  matchedRuleType?: string;
  matchedPattern?: string;
  targetProfileId: string;
  targetProfileName: string;
  proxySummary: string;
  status: number | string;
  durationMs: number;
  tabId?: number;
  tabUrl?: string;
  fromCache?: boolean;
}

export interface WebDavConfig {
  enabled: boolean;
  serverUrl: string;
  username?: string;
  password?: string;
  remotePath?: string;
  autoSync?: boolean;
  lastSyncTime?: string;
}

export interface GitHubGistConfig {
  enabled: boolean;
  personalAccessToken?: string;
  gistId?: string;
  filename?: string;
  autoSync?: boolean;
  lastSyncTime?: string;
}

export interface CloudSyncSettings {
  webdav: WebDavConfig;
  gist: GitHubGistConfig;
}

export interface TabOverride {
  tabId: number;
  tabUrl: string;
  tabTitle?: string;
  profileId: string;
  expireAt?: number;
  enabled: boolean;
}
