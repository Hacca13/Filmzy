import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CloseGuard, closeQuestion, type CloseChoice } from './close-guard.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function guardWith(jobs: { open: number }, choice: CloseChoice) {
  const deps = {
    openJobs: () => jobs.open,
    ask: vi.fn(() => Promise.resolve(choice)),
    closeNow: vi.fn(),
    onWaiting: vi.fn(),
    pollMs: 1000,
  };
  return { guard: new CloseGuard(deps), deps };
}

describe('chiudere con lavori aperti (D63)', () => {
  it('senza lavori si chiude subito, senza domande', () => {
    const { guard, deps } = guardWith({ open: 0 }, 'back');

    expect(guard.shouldClose()).toBe(true);
    expect(deps.ask).not.toHaveBeenCalled();
  });

  it('con lavori la chiusura si ferma e si chiede, una volta sola anche con due clic', async () => {
    const { guard, deps } = guardWith({ open: 2 }, 'back');

    expect(guard.shouldClose()).toBe(false);
    expect(guard.shouldClose()).toBe(false);
    await vi.runAllTimersAsync();

    expect(deps.ask).toHaveBeenCalledTimes(1);
    expect(deps.ask).toHaveBeenCalledWith(2);
    expect(deps.closeNow).not.toHaveBeenCalled();
  });

  it('«Chiudi lo stesso» chiude, e la chiusura che segue passa', async () => {
    const { guard, deps } = guardWith({ open: 1 }, 'close');

    guard.shouldClose();
    await vi.runAllTimersAsync();

    expect(deps.closeNow).toHaveBeenCalledTimes(1);
    expect(guard.shouldClose()).toBe(true);
  });

  it('«Aspetta che finisca» chiude da solo quando i lavori finiscono', async () => {
    const jobs = { open: 1 };
    const { guard, deps } = guardWith(jobs, 'wait');

    guard.shouldClose();
    await vi.advanceTimersByTimeAsync(3000);
    expect(deps.onWaiting).toHaveBeenCalledWith(true);
    expect(deps.closeNow).not.toHaveBeenCalled();

    jobs.open = 0;
    await vi.advanceTimersByTimeAsync(1000);

    expect(deps.closeNow).toHaveBeenCalledTimes(1);
    expect(deps.onWaiting).toHaveBeenLastCalledWith(false);
  });

  it('«Torna al film» mentre aspetta smette di aspettare', async () => {
    const jobs = { open: 1 };
    const { guard, deps } = guardWith(jobs, 'wait');
    guard.shouldClose();
    await vi.advanceTimersByTimeAsync(10);

    deps.ask.mockResolvedValueOnce('back');
    guard.shouldClose();
    await vi.advanceTimersByTimeAsync(10);
    jobs.open = 0;
    await vi.advanceTimersByTimeAsync(5000);

    expect(deps.onWaiting).toHaveBeenLastCalledWith(false);
    expect(deps.closeNow).not.toHaveBeenCalled();
  });
});

describe('le parole della finestra', () => {
  it('dicono quanti lavori ci sono, che si fermano e di chi è la scelta', () => {
    expect(closeQuestion(1).message).toBe('Sto ancora lavorando a una cosa');
    expect(closeQuestion(2).message).toBe('Sto ancora lavorando a 2 cose');
    expect(closeQuestion(2).detail).toContain('addebitate');
    expect(closeQuestion(2).detail).toContain('non ripartono da sole');
    expect(closeQuestion(2).detail).toContain('la scelta è tua');
  });
});
