import dns from "node:dns";
import os from "node:os";

export function resolveHostname(ip: string | undefined): Promise<string> {
  return new Promise((resolve) => {
    if (!ip) {
      resolve(os.hostname());
      return;
    }
    const cleanIP = ip.replace(/^::ffff:/, "");
    if (cleanIP === "::1" || cleanIP === "127.0.0.1") {
      resolve(os.hostname());
      return;
    }
    dns.reverse(cleanIP, (err, hostnames) => {
      if (err || !hostnames || hostnames.length === 0) {
        resolve(cleanIP);
      } else {
        const first = hostnames[0];
        resolve(typeof first === "string" && first.length > 0 ? first : cleanIP);
      }
    });
  });
}

export function getLanAddress(): Promise<string> {
  return new Promise((resolve) => {
    dns.lookup(os.hostname(), { family: 4 }, (err, addr) => {
      if (err || !addr) resolve("your local IP");
      else resolve(addr);
    });
  });
}
