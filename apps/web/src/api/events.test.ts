import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeEvents, type LiveEvent } from './events';

/** Un EventSource finto: il test decide quando si apre e cosa arriva. */
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1;
  onmessage: ((message: { data: string }) => void) | null = null;
  closed = false;

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this);
  }

  close(): void {
    this.closed = true;
  }

  open(): void {
    this.onopen?.();
  }

  fail(): void {
    this.onerror?.();
  }

  send(data: string): void {
    this.onmessage?.({ data });
  }
}

const job = (status: string) =>
  JSON.stringify({
    type: 'job.changed',
    jobId: 'j-1',
    kind: 'take_generate',
    status,
    projectId: 'film-1',
    subjectId: 'shot-1',
  });

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal('EventSource', FakeEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('subscribeEvents', () => {
  it('apre una connessione sola per tutti, sul percorso degli eventi, e la chiude quando non ascolta più nessuno', () => {
    const off1 = subscribeEvents(() => undefined);
    const off2 = subscribeEvents(() => undefined);

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0]?.url).toBe('/api/events');

    off1();
    expect(FakeEventSource.instances[0]?.closed).toBe(false);
    off2();
    expect(FakeEventSource.instances[0]?.closed).toBe(true);
  });

  it('chi ascolta riceve i lavori cambiati, già controllati dallo schema', () => {
    const received: LiveEvent[] = [];
    const off = subscribeEvents((event) => received.push(event));

    FakeEventSource.instances[0]?.send(job('running'));
    FakeEventSource.instances[0]?.send(job('done'));
    off();

    expect(received.map((event) => event.type === 'job.changed' && event.status)).toEqual([
      'running',
      'done',
    ]);
  });

  it('ignora ciò che non è un nostro evento: un testo che non è JSON, o un evento di un altro tipo', () => {
    const received: LiveEvent[] = [];
    const off = subscribeEvents((event) => received.push(event));

    FakeEventSource.instances[0]?.send('non è json');
    FakeEventSource.instances[0]?.send(JSON.stringify({ type: 'boh' }));
    FakeEventSource.instances[0]?.send(
      JSON.stringify({ type: 'job.changed', jobId: 'j', kind: 'x', status: 'inventato' }),
    );
    FakeEventSource.instances[0]?.send(
      JSON.stringify({
        type: 'continuity.flagged',
        shotId: 's',
        code: 'r',
        reason: 'x',
        origin: 'rule',
      }),
    );
    off();

    expect(received).toEqual([]);
  });

  it('a ogni apertura, anche la prima, avvisa che può essere cambiato qualcosa: fra la lettura e il flusso passa del tempo', () => {
    const received: LiveEvent[] = [];
    const off = subscribeEvents((event) => received.push(event));

    FakeEventSource.instances[0]?.open();
    expect(received).toEqual([{ type: 'reconnected' }]);
    FakeEventSource.instances[0]?.open();
    expect(received).toEqual([{ type: 'reconnected' }, { type: 'reconnected' }]);
    off();
  });

  it('se il browser rinuncia, dopo qualche secondo si riapre da capo; se nel frattempo non ascolta più nessuno, no', () => {
    vi.useFakeTimers();
    try {
      const off = subscribeEvents(() => undefined);
      const first = FakeEventSource.instances[0];
      if (first === undefined) throw new Error('doveva aprirsi');

      first.readyState = 2;
      first.fail();
      expect(first.closed).toBe(true);
      vi.advanceTimersByTime(3000);
      expect(FakeEventSource.instances).toHaveLength(2);

      const second = FakeEventSource.instances[1];
      if (second === undefined) throw new Error('doveva riaprirsi');
      second.readyState = 2;
      second.fail();
      off();
      vi.advanceTimersByTime(10_000);
      expect(FakeEventSource.instances).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('mentre il browser sta riprovando da solo non si fa niente', () => {
    const off = subscribeEvents(() => undefined);
    const only = FakeEventSource.instances[0];
    if (only === undefined) throw new Error('doveva aprirsi');

    only.readyState = 0;
    only.fail();

    expect(only.closed).toBe(false);
    expect(FakeEventSource.instances).toHaveLength(1);
    off();
  });

  it('un ascoltatore che smette non riceve più niente, e uno nuovo riparte da una connessione pulita', () => {
    const first: LiveEvent[] = [];
    const off = subscribeEvents((event) => first.push(event));
    off();

    const second: LiveEvent[] = [];
    const offSecond = subscribeEvents((event) => second.push(event));
    FakeEventSource.instances[1]?.send(job('running'));
    offSecond();

    expect(first).toEqual([]);
    expect(second).toHaveLength(1);
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it('senza EventSource (come nei test dell’interfaccia) non si rompe niente', () => {
    vi.unstubAllGlobals();

    const off = subscribeEvents(() => undefined);

    expect(() => {
      off();
    }).not.toThrow();
  });
});
