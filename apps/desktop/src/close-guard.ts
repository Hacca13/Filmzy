/** Le tre scelte della finestra «Sto ancora lavorando» (D63). */
export type CloseChoice = 'wait' | 'back' | 'close';

export interface CloseGuardDeps {
  /** I lavori in coda o in corso, adesso. */
  openJobs: () => number;
  ask: (count: number) => Promise<CloseChoice>;
  /** Chiude davvero: la guardia lascia passare la chiusura che segue. */
  closeNow: () => void;
  /** «Aspetta che finisca» è cominciato o finito: la finestra lo può dire nel titolo. */
  onWaiting: (waiting: boolean) => void;
  pollMs?: number;
}

/**
 * Chiudere il programma con lavori aperti (D63): la chiusura si ferma e l'utente sceglie. Senza lavori si chiude
 * subito. «Chiudi lo stesso» non si impedisce mai: la responsabilità è dell'utente, e la finestra lo dice.
 */
export class CloseGuard {
  private allowed = false;
  private asking = false;
  private waiting: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly deps: CloseGuardDeps) {}

  /** Da chiamare quando la finestra sta per chiudersi: vero se può farlo adesso. */
  shouldClose(): boolean {
    if (this.allowed) return true;
    const count = this.deps.openJobs();
    if (count === 0) return true;
    if (!this.asking) void this.askAbout(count);
    return false;
  }

  private async askAbout(count: number): Promise<void> {
    this.asking = true;
    try {
      const choice = await this.deps.ask(count);
      if (choice === 'close') this.closeAnyway();
      else if (choice === 'wait') this.waitThenClose();
      else this.stopWaiting();
    } finally {
      this.asking = false;
    }
  }

  private waitThenClose(): void {
    if (this.waiting !== undefined) return;
    this.deps.onWaiting(true);
    this.waiting = setInterval(() => {
      if (this.deps.openJobs() === 0) this.closeAnyway();
    }, this.deps.pollMs ?? 2000);
  }

  private closeAnyway(): void {
    this.stopWaiting();
    this.allowed = true;
    this.deps.closeNow();
  }

  private stopWaiting(): void {
    if (this.waiting === undefined) return;
    clearInterval(this.waiting);
    this.waiting = undefined;
    this.deps.onWaiting(false);
  }
}

/** Le parole della finestra (D63): quanti lavori, cosa succede chiudendo adesso, di chi è la scelta. */
export function closeQuestion(count: number): { message: string; detail: string } {
  return {
    message:
      count === 1
        ? 'Sto ancora lavorando a una cosa'
        : `Sto ancora lavorando a ${String(count)} cose`,
    detail:
      'Se chiudi adesso si fermano. Se sono a pagamento, il servizio può averle già fatte e addebitate, ' +
      'e quando riapri Filmzy non ripartono da sole. Se chiudi lo stesso, la scelta è tua.',
  };
}
