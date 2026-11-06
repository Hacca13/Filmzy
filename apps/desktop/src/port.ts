import { createServer } from 'node:net';

/**
 * Una porta libera, a partire da quella di sempre. Sempre la stessa, quando si può: l'interfaccia ricorda le
 * piccole scelte per indirizzo, e con una porta nuova a ogni avvio le perderebbe. Se è occupata da un altro
 * programma si prova la successiva.
 */
export async function freePort(preferred: number, host: string, tries = 20): Promise<number> {
  for (let port = preferred; port < preferred + tries; port += 1) {
    if (await isFree(port, host)) return port;
  }
  throw new Error(
    `Nessuna porta libera fra ${String(preferred)} e ${String(preferred + tries - 1)}.`,
  );
}

function isFree(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once('error', () => {
      resolve(false);
    });
    probe.listen(port, host, () => {
      probe.close(() => {
        resolve(true);
      });
    });
  });
}
