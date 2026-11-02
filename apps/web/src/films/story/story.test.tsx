import {
  ROLE_OUTPUT_EXAMPLES,
  screenplaySchema,
  type ScreenplayVersionSummary,
} from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ReviseBox } from './ReviseBox';
import { ScreenplayView, VersionPicker } from './ScreenplayView';
import { namesOf, sceneMeta, totalDuration, versionLabel, versionNote } from './model';

const screenplay = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

function summary(version: number, request?: string): ScreenplayVersionSummary {
  return {
    id: `v-${String(version)}`,
    projectId: 'film-1',
    stage: 'draft',
    version,
    title: screenplay.title,
    createdAt: '2026-10-28T10:00:00.000Z',
    ...(request === undefined ? {} : { request }),
  };
}

describe('model', () => {
  it('le versioni si chiamano per numero, e la più recente lo dice', () => {
    expect(versionLabel(summary(1), false)).toBe('Versione 1');
    expect(versionLabel(summary(3), true)).toBe('Versione 3 · la più recente');
  });

  it('di ogni versione si dice cosa l’ha prodotta', () => {
    expect(versionNote(summary(1))).toBe('Bozza iniziale');
    expect(versionNote(summary(2))).toBe('Riscritta da zero');
    expect(versionNote(summary(2, 'Più cupa'))).toBe('«Più cupa»');
  });

  it('una scena ha durata e momento della giornata; la storia ha la durata totale', () => {
    const scene = { ...screenplay.scenes[0], durationS: 15.4, timeOfDay: 'tramonto' } as never;

    expect(sceneMeta(scene)).toBe('15 s · tramonto');
    expect(totalDuration({ ...screenplay, scenes: [scene, scene, scene, scene, scene] })).toBe(
      '1 min 17 s',
    );
  });

  it('i nomi citati da una scena vengono dalle proposte; un id sconosciuto si salta', () => {
    expect(namesOf(['anna', 'sconosciuto'], [{ id: 'anna', name: 'Anna' }])).toEqual(['Anna']);
    expect(namesOf([], [{ id: 'anna', name: 'Anna' }])).toEqual([]);
  });
});

describe('ScreenplayView', () => {
  it('mostra titolo, trama, scene riassunte, personaggi e luoghi proposti', () => {
    const html = renderToStaticMarkup(<ScreenplayView screenplay={screenplay} />);

    expect(html).toContain(screenplay.title);
    expect(html).toContain(screenplay.logline);
    expect(html).toContain(screenplay.scenes[0]?.summary ?? 'manca');
    expect(html).toContain('Personaggi proposti');
    expect(html).toContain(screenplay.characters[0]?.name ?? 'manca');
    expect(html).toContain('Luoghi proposti');
    expect(html).toContain(screenplay.locations[0]?.name ?? 'manca');
  });

  it('una scena nomina chi ci sta, con il nome e non con l’id', () => {
    const withPeople = {
      ...screenplay,
      scenes: [{ ...screenplay.scenes[0], characterIds: [screenplay.characters[0]?.id] }],
    } as never;

    const html = renderToStaticMarkup(<ScreenplayView screenplay={withPeople} />);

    expect(html).toContain(`Con ${screenplay.characters[0]?.name ?? 'manca'}`);
  });

  it('senza proposte non mostra le sezioni vuote', () => {
    const html = renderToStaticMarkup(
      <ScreenplayView screenplay={{ ...screenplay, characters: [], locations: [] }} />,
    );

    expect(html).not.toContain('Personaggi proposti');
    expect(html).not.toContain('Luoghi proposti');
  });

  it('non mostra parole tecniche', () => {
    const html = renderToStaticMarkup(<ScreenplayView screenplay={screenplay} />).toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });
});

describe('VersionPicker', () => {
  const versions = [summary(2, 'Più cupa'), summary(1)];

  it('con una versione sola non serve', () => {
    expect(
      renderToStaticMarkup(
        <VersionPicker versions={[summary(1)]} selectedId="v-1" onSelect={() => undefined} />,
      ),
    ).toBe('');
  });

  it('elenca le versioni dalla più recente, ognuna con la sua richiesta, e segna quella letta', () => {
    const html = renderToStaticMarkup(
      <VersionPicker versions={versions} selectedId="v-1" onSelect={() => undefined} />,
    );

    expect(html).toContain('Versione 2 · la più recente');
    expect(html).toContain('«Più cupa»');
    expect(html).toContain('Bozza iniziale');
    expect(html.indexOf('Versione 2')).toBeLessThan(html.indexOf('Versione 1'));
    expect(html).toContain('aria-current="true"');
  });
});

describe('ReviseBox', () => {
  const render = (request: string, extra: { estimateUsd?: number; busy?: boolean } = {}) =>
    renderToStaticMarkup(
      <ReviseBox
        request={request}
        onChange={() => undefined}
        onSubmit={() => undefined}
        estimateUsd={extra.estimateUsd}
        busy={extra.busy ?? false}
      />,
    );

  it('si chiama «Parla con lo sceneggiatore» e dice che ogni richiesta fa una versione nuova', () => {
    const html = render('');

    expect(html).toContain('Parla con lo sceneggiatore');
    expect(html).toContain('quella di prima resta');
  });

  it('senza una richiesta il pulsante è spento; con la richiesta e la stima mostra il costo', () => {
    expect(render('')).toContain('disabled=""');

    const html = render('Più cupa', { estimateUsd: 0.0421 });
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('Chiedi la modifica · circa 0,0421 $');
  });

  it('mentre scrive il pulsante è spento e lo dice', () => {
    const html = render('Più cupa', { busy: true });

    expect(html).toContain('Sto scrivendo…');
    expect(html).toContain('disabled=""');
  });
});
