import type { ShotTake } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TakeItem } from './TakeItem';

const take = (status: ShotTake['status'], extra: Partial<ShotTake> = {}): ShotTake => ({
  id: 't-1',
  status,
  modelId: 'kling-o3-standard',
  modelLabel: 'Kling · Standard',
  chosen: false,
  createdAt: '2026-11-03T10:00:00.000Z',
  ...extra,
});

const render = (item: ShotTake, props: { kept?: boolean; busy?: boolean } = {}) =>
  renderToStaticMarkup(
    <TakeItem
      take={item}
      title="Take 2"
      kept={props.kept ?? false}
      busy={props.busy ?? false}
      onKeep={() => undefined}
      onUseFrame={() => undefined}
    />,
  );

describe('TakeItem (T4.6)', () => {
  it('un take riuscito che non è tenuto offre di tenerlo e di ripartire da un fotogramma', () => {
    const html = render(take('succeeded', { assetId: 'clip-1' }));

    expect(html).toContain('Take 2');
    expect(html).toContain('Tieni questo take');
    expect(html).toContain('Usa questo fotogramma come punto di partenza');
    expect(html).not.toContain('Quello tenuto');
    expect(html).toContain('/api/assets/clip-1');
  });

  it('il take tenuto lo dice, e non offre di tenerlo di nuovo; il fotogramma si può prendere lo stesso', () => {
    const html = render(take('succeeded', { assetId: 'clip-1', chosen: true }), { kept: true });

    expect(html).toContain('Quello tenuto');
    expect(html).not.toContain('Tieni questo take');
    expect(html).toContain('Usa questo fotogramma come punto di partenza');
  });

  it('un take in coda, in lavorazione o fallito non offre né di tenerlo né un fotogramma', () => {
    for (const status of ['queued', 'running', 'failed'] as const) {
      const html = render(take(status));

      expect(html, status).not.toContain('Tieni questo take');
      expect(html, status).not.toContain('Usa questo fotogramma');
      expect(html, status).not.toContain('<video');
    }
  });

  it('mentre un’altra azione lavora i pulsanti aspettano', () => {
    const html = render(take('succeeded', { assetId: 'clip-1' }), { busy: true });

    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => button.includes('disabled'))).toBe(true);
  });
});
