import os from 'os';

const PREFERRED_INTERFACE_PATTERNS = [/^en\d+/i, /^eth\d+/i, /wi-?fi/i, /wlan/i, /ethernet/i];

const isPrivateIPv4 = (ip: string): boolean => {
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  const match = ip.match(/^172\.(\d+)\./);
  if (!match) return false;
  const second = Number(match[1]);
  return second >= 16 && second <= 31;
};

export function getLanIPv4Addresses(): string[] {
  const interfaces = os.networkInterfaces();
  const ranked: Array<{ ip: string; score: number }> = [];

  for (const [name, iface] of Object.entries(interfaces)) {
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family !== 'IPv4' || alias.internal) continue;
      const isPreferredName = PREFERRED_INTERFACE_PATTERNS.some((pattern) => pattern.test(name));
      const score = (isPrivateIPv4(alias.address) ? 2 : 0) + (isPreferredName ? 1 : 0);
      ranked.push({ ip: alias.address, score });
    }
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.map((entry) => entry.ip);
}

export function getBestLanIPv4(): string | null {
  const addresses = getLanIPv4Addresses();
  return addresses.length > 0 ? addresses[0] : null;
}

export function buildNetworkInfo(port: number) {
  const ipAddresses = getLanIPv4Addresses();
  const lanIp = ipAddresses.length > 0 ? ipAddresses[0] : null;
  const controlUrlLan = lanIp ? `http://${lanIp}:${port}/control` : null;
  const controlUrlLocal = `http://localhost:${port}/control`;

  return {
    lanIp,
    ipAddresses,
    port,
    controlUrlLan,
    controlUrlLocal,
    warning: lanIp
      ? null
      : 'No LAN IPv4 address detected. Other devices may not reach this machine. Check network adapter and firewall settings.',
  };
}
