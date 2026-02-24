import net from 'net';

export function isPortFree(port: number, host: string = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

export async function findFirstAvailablePort(candidates: number[], host: string = '0.0.0.0'): Promise<number | null> {
  for (const port of candidates) {
    const available = await isPortFree(port, host);
    if (available) return port;
  }

  return null;
}
