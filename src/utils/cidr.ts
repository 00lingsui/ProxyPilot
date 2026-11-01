/**
 * CIDR & IP Utilities for PAC generation and rule simulation
 */

export function prefixToSubnetMask(prefix: number): string {
  const p = Math.max(0, Math.min(32, prefix));
  const mask = [];
  let remaining = p;
  for (let i = 0; i < 4; i++) {
    const n = Math.min(remaining, 8);
    mask.push(256 - Math.pow(2, 8 - n));
    remaining -= n;
  }
  return mask.join('.');
}

export function parseCidr(cidr: string): { ip: string; prefix: number; mask: string } | null {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) return null;
  const ip = parts[0].trim();
  const prefix = parseInt(parts[1].trim(), 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  return {
    ip,
    prefix,
    mask: prefixToSubnetMask(prefix),
  };
}

function ipToLong(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const parsed = parseCidr(cidr);
    if (!parsed) return false;
    const ipNum = ipToLong(ip);
    const netNum = ipToLong(parsed.ip);
    const maskNum = ipToLong(parsed.mask);
    return (ipNum & maskNum) === (netNum & maskNum);
  } catch {
    return false;
  }
}
