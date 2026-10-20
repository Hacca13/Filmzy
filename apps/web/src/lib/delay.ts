/**
 * Aspetta `milliseconds` e poi si risolve. Se il segnale viene annullato prima, si risolve subito:
 * chi aspetta se ne accorge controllando `signal.aborted`.
 */
export function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
