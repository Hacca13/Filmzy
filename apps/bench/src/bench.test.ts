import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { runEval } from './eval.js';
import { runBench, type BenchRunResult } from './run.js';
import { scoreBench } from './score.js';

/**
 * La prova della prova: una matrice minuscola col fornitore finto, dal take al punteggio. Non
 * tocca la rete e non costa niente (regola d'oro 5): serve a vedere che la macchina gira prima di
 * spendere davvero in T4.0.
 */

const CONFIG_DIR = fileURLToPath(new URL('../../../config', import.meta.url));

/** Un piano piccolo: un personaggio, due inquadrature, un modello, due take. */
const PIANO = `name: prova-finta
budget_usd: 50
style: realistic
cinematography: handheld_warm

characters:
  - id: anna
    name: Anna
    brief: "donna sui 35 anni, capelli ricci rossi raccolti, giacca di jeans chiara"

sheet:
  model: nano-banana-2
  angles: [front]
  attempts_per_angle: 1

shots:
  - id: close_front
    action: "Anna guarda in camera e sorride appena"
    framing: close_up
    characters: [anna]
  - id: wide
    action: "Anna attraversa una piazza al tramonto"
    framing: wide
    characters: [anna]

models: [kling-o3-standard]
takes_per_shot: 2
duration_s: 5

voting:
  voters: 1
  blind: true
  criteria: [face, clothing]
  scale: [1, 5]
  usable_threshold: 4

success:
  usable_takes_per_shot: 2
`;

async function writePlan(contents: string): Promise<{ dir: string; planPath: string }> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-bench-'));
  const planPath = path.join(dir, 'piano.yaml');
  await writeFile(planPath, contents, 'utf8');
  return { dir, planPath };
}

describe('la prova dei modelli col fornitore finto (§4.13)', () => {
  let outputDir: string;
  let result: BenchRunResult;

  beforeAll(async () => {
    const { dir, planPath } = await writePlan(PIANO);
    outputDir = dir;
    result = await runBench({
      planPath,
      configDir: CONFIG_DIR,
      environment: 'offline',
      outputDir,
      pollIntervalMs: 0,
      now: () => new Date('2026-10-21T10:00:00.000Z'),
    });
  }, 60_000);

  it('genera la scheda del personaggio e tutti i take del piano', () => {
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0]?.state).toBe('succeeded');

    // Due inquadrature x un modello x due take.
    expect(result.takes).toHaveLength(4);
    expect(result.takes.every((take) => take.state === 'succeeded')).toBe(true);
    expect(result.takes.every((take) => take.file !== undefined)).toBe(true);
  });

  it('lascia uno scontrino per ogni chiamata, scheda e prompt compresi', () => {
    // Una scheda, due prompt del direttore della fotografia, quattro take: niente lavoro silenzioso.
    const chiusi = result.receipts.filter((receipt) => receipt.status === 'succeeded');
    expect(chiusi.filter((receipt) => receipt.role === 'character_designer')).toHaveLength(1);
    expect(chiusi.filter((receipt) => receipt.role === 'cinematographer')).toHaveLength(2);
    expect(chiusi.filter((receipt) => receipt.role === 'camera_operator')).toHaveLength(4);
  });

  it('scrive la cartella della prova con report, take, schede e scontrini', async () => {
    const letti = await Promise.all(
      ['report.html', 'take.json', 'schede.json', 'scontrini.json'].map((name) =>
        readFile(path.join(result.dir, name), 'utf8'),
      ),
    );

    const [report] = letti;
    expect(report).toContain('<video');
    expect(letti.every((contents) => contents.length > 0)).toBe(true);
  });

  it('il report è alla cieca: i nomi dei servizi sono nascosti', async () => {
    const report = await readFile(path.join(result.dir, 'report.html'), 'utf8');
    const label = result.takes[0]?.modelLabel ?? '';

    expect(label).not.toBe('');
    expect(report).toContain('Take A');
    // Il nome del servizio sta solo nel paragrafo nascosto, che un pulsante scopre dopo il voto.
    for (const riga of report.split('\n').filter((line) => line.includes(label))) {
      expect(riga).toContain('class="nome" hidden');
    }
  });

  it('dai voti escono i punteggi: take usabili e costo per secondo usabile', async () => {
    // Come se una persona avesse votato nel report: tutti i take di una inquadratura a 5, gli altri a 2.
    const voti = Object.fromEntries(
      result.takes.map((take) => [
        take.id,
        take.shotId === 'close_front' ? { face: 5, clothing: 5 } : { face: 2, clothing: 2 },
      ]),
    );
    await writeFile(
      path.join(result.dir, 'voti.json'),
      `${JSON.stringify({ votante: 'prova', voti }, null, 2)}\n`,
      'utf8',
    );

    const score = await scoreBench(result.dir, path.join(outputDir, 'piano.yaml'));
    const model = score.models[0];

    expect(score.voters).toBe(1);
    expect(model?.takes).toBe(4);
    expect(model?.usable).toBe(2);
    expect(model?.averageScore).toBeCloseTo(3.5);
    expect(model?.costPerUsableSecondUsd).toBeGreaterThan(0);
    // Una inquadratura su due ha i take usabili che il piano chiede: non basta.
    expect(model?.meetsSuccess).toBe(false);
  });
});

describe('il budget del piano ferma la prova prima di spendere', () => {
  it('con un budget piccolo non manda nessun lavoro e non crea niente', async () => {
    const { planPath } = await writePlan(PIANO.replace('budget_usd: 50', 'budget_usd: 0.01'));
    const outputDir = await mkdtemp(path.join(tmpdir(), 'filmzy-bench-'));

    await expect(
      runBench({ planPath, configDir: CONFIG_DIR, environment: 'offline', outputDir }),
    ).rejects.toThrow(/budget/i);
    expect(await readdir(outputDir)).toHaveLength(0);
  });

  it('chi lancia la prova può dire no quando vede la cifra, e non parte niente', async () => {
    const { planPath } = await writePlan(PIANO);
    const outputDir = await mkdtemp(path.join(tmpdir(), 'filmzy-bench-'));
    let vista: number | undefined;

    await expect(
      runBench({
        planPath,
        configDir: CONFIG_DIR,
        environment: 'offline',
        outputDir,
        confirm: (stima) => {
          vista = stima;
          return Promise.resolve(false);
        },
      }),
    ).rejects.toThrow(/annullata/i);

    expect(vista).toBeGreaterThan(0);
    expect(await readdir(outputDir)).toHaveLength(0);
  });
});

describe('le valutazioni dei ruoli di testo (§4.13)', () => {
  it('gira tutti gli esempi fissi del direttore della fotografia', async () => {
    const result = await runEval({
      role: 'cinematographer',
      configDir: CONFIG_DIR,
      evalsDir: path.join(CONFIG_DIR, 'evals'),
      environment: 'offline',
    });

    expect(result.cases.length).toBeGreaterThanOrEqual(5);
    expect(result.cases.every((esito) => esito.output !== undefined)).toBe(true);
    // Il fornitore finto dichiara dei token, quindi lo scontrino calcola quanto *sarebbe* costato
    // col prezzo del catalogo: soldi veri zero, ma la catena del costo si vede funzionare (§4.11).
    expect(result.totalCostUsd).toBeGreaterThan(0);

    // Il fornitore finto risponde sempre lo stesso prompt: il primo esempio passa, e quello con
    // due personaggi no, perché manca il segnaposto del secondo. È la prova che le regole mordono.
    expect(result.cases[0]?.passed).toBe(true);
    const due = result.cases.find((esito) => esito.name.includes('due personaggi'));
    expect(due?.passed).toBe(false);
    expect(due?.problems.join(' ')).toContain('[[char:tomas]]');
  }, 30_000);
});
