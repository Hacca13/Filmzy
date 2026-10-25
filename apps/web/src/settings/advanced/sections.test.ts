import { troupeConfigSchema, type ConfigIssue } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { orphanIssues, SECTIONS, splitIssues, type SectionDef } from './sections';
import { sampleConfig } from './test.fixtures';

const config = sampleConfig;

function section(id: string): SectionDef {
  const found = SECTIONS.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`sezione ${id} non trovata`);
  return found;
}

describe('la configurazione di prova è valida', () => {
  it('passa lo schema (altrimenti i test sotto non dicono niente)', () => {
    expect(troupeConfigSchema.safeParse(config).success).toBe(true);
  });
});

describe('riassunti', () => {
  it('connessioni: nome, tipo e se è attiva', () => {
    expect(
      section('connections')
        .items(config)
        .map((item) => item.summary),
    ).toEqual(['fake · fake · Attiva', 'fal · fal · Spenta']);
  });

  it('modelli: nome, fornitore, tipo, prezzo e stato', () => {
    expect(
      section('models')
        .items(config)
        .map((item) => item.summary),
    ).toEqual([
      'Finto · fake · Testo · 1 / 2 $ per milione di token · Attivo',
      'Clip · fake · Musica · 0.3 $ al secondo · In prova',
    ]);
  });

  it('ruoli: nome, servizio e istruzioni', () => {
    expect(section('roles').items(config)[0]?.summary).toBe('Moderatore · finto · moderator@1');
  });

  it("preset: categoria e nome, nell'ordine delle categorie", () => {
    expect(
      section('presets')
        .items(config)
        .map((item) => item.summary),
    ).toEqual(['Stili · Realistico', 'Generi · Drammatico']);
  });

  it('una voce a metà non rompe il riassunto', () => {
    const broken = section('models').replace(config, 'finto', { kind: 'llm' });

    expect(section('models').items(broken)[0]?.summary).toBe('finto ·  · Testo · senza prezzo · ');
  });
});

describe('modifiche', () => {
  it('cambiare una voce non tocca le altre', () => {
    const next = section('connections').replace(config, 'fal', {
      ...config.connections.fal,
      enabled: true,
    });

    expect(next.connections.fal?.enabled).toBe(true);
    expect(next.connections.fake).toEqual(config.connections.fake);
    expect(Object.keys(next.connections)).toEqual(['fake', 'fal']);
  });

  it('togliere una connessione la toglie', () => {
    const next = section('connections').remove?.(config, 'fal');

    expect(Object.keys(next?.connections ?? {})).toEqual(['fake']);
  });

  it('aggiungere un modello crea una voce col nome dato', () => {
    const next = section('models').addTargets[0]?.add(config, 'nuovo');

    expect(Object.keys(next?.models ?? {})).toEqual(['finto', 'clip', 'nuovo']);
    expect(next?.models.nuovo).toMatchObject({ kind: 'llm' });
  });

  it('i ruoli si cambiano ma non si aggiungono né si tolgono', () => {
    expect(section('roles').addTargets).toEqual([]);
    expect(section('roles').remove).toBeUndefined();
    expect(section('roles').items(config)[0]?.removable).toBe(false);
  });

  it("un preset si cambia per posizione, anche se se ne cambia l'id", () => {
    const next = section('presets').replace(config, 'styles:0', {
      ...config.presets.styles[0],
      id: 'nuovo-nome',
    });

    expect(next.presets.styles[0]?.id).toBe('nuovo-nome');
  });

  it('aggiungere un preset lo mette in fondo alla sua categoria, col nome come id', () => {
    const target = section('presets').addTargets.find((candidate) => candidate.label === 'genere');
    const next = target?.add(config, 'commedia');

    expect(next?.presets.genres.map((genre) => genre.id)).toEqual(['dramma', 'commedia']);
    expect(next?.presets.styles).toEqual(config.presets.styles);
  });

  it('togliere un preset toglie solo quello', () => {
    const next = section('presets').remove?.(config, 'genres:0');

    expect(next?.presets.genres).toEqual([]);
    expect(next?.presets.styles).toHaveLength(1);
  });

  it('funzioni e limiti si cambiano come voci intere', () => {
    const next = section('features').replace(config, 'limits', { max_characters: 5 });

    expect(next.limits.max_characters).toBe(5);
    expect(next.features).toEqual(config.features);
  });
});

describe('problemi del validatore', () => {
  const issue = (extra: Partial<ConfigIssue>): ConfigIssue => ({
    severity: 'error',
    code: 'x',
    message: 'm',
    ...extra,
  });

  it('un problema che nomina una voce va sulla voce, gli altri sulla sezione', () => {
    const roles = section('roles');
    const split = splitIssues(roles, roles.items(config), [
      issue({ section: 'roles', key: 'moderator' }),
      issue({ section: 'roles', key: 'sconosciuto', message: 'altro' }),
      issue({ section: 'models', key: 'finto' }),
    ]);

    expect(split.byItem.get('moderator')).toHaveLength(1);
    expect(split.general.map((entry) => entry.message)).toEqual(['altro']);
  });

  it('le istruzioni che non rendono finiscono sul ruolo che le usa', () => {
    const roles = section('roles');
    const split = splitIssues(roles, roles.items(config), [
      issue({ section: 'instructions', role: 'moderator' }),
    ]);

    expect(split.byItem.get('moderator')).toHaveLength(1);
  });

  it('i problemi che nessuna sezione mostra non si perdono', () => {
    const orphans = orphanIssues([
      issue({ section: 'bench' }),
      issue({}),
      issue({ section: 'models' }),
      issue({ section: 'instructions' }),
    ]);

    expect(orphans).toHaveLength(2);
  });
});
