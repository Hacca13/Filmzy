import type { DomainEvent } from '@filmzy/contracts';
import { Logger } from '@nestjs/common';
import { beforeAll, describe, expect, it } from 'vitest';

import { EventBus } from './event-bus.js';

beforeAll(() => {
  Logger.overrideLogger(false);
});

const event: DomainEvent = {
  type: 'job.changed',
  jobId: 'j-1',
  kind: 'take_generate',
  status: 'running',
};

describe('EventBus', () => {
  it('chi è iscritto riceve gli eventi, e smette appena si disiscrive', () => {
    const bus = new EventBus();
    const received: DomainEvent[] = [];
    const off = bus.subscribe((e) => received.push(e));

    bus.publish(event);
    off();
    bus.publish({ ...event, status: 'done' });

    expect(received).toEqual([event]);
  });

  it('un evento arriva a tutti gli iscritti, e senza iscritti non succede niente', () => {
    const bus = new EventBus();
    expect(() => {
      bus.publish(event);
    }).not.toThrow();

    let first = 0;
    let second = 0;
    bus.subscribe(() => {
      first += 1;
    });
    bus.subscribe(() => {
      second += 1;
    });
    bus.publish(event);

    expect([first, second]).toEqual([1, 1]);
  });

  it('un ascoltatore che sbaglia non ferma gli altri né chi pubblica', () => {
    const bus = new EventBus();
    const received: DomainEvent[] = [];
    bus.subscribe(() => {
      throw new Error('rotto');
    });
    bus.subscribe((e) => received.push(e));

    expect(() => {
      bus.publish(event);
    }).not.toThrow();
    expect(received).toEqual([event]);
  });

  it('un ascoltatore che si disiscrive mentre riceve non fa saltare nessuno', () => {
    const bus = new EventBus();
    const order: string[] = [];
    const off = bus.subscribe(() => {
      order.push('primo');
      off();
    });
    bus.subscribe(() => order.push('secondo'));

    bus.publish(event);
    bus.publish(event);

    expect(order).toEqual(['primo', 'secondo', 'secondo']);
  });
});
