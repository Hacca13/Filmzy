import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
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

describe('gli esempi fissi degli altri ruoli di testo (T3.10)', () => {
  const evaluate = (role: string, extra: Partial<Parameters<typeof runEval>[0]> = {}) =>
    runEval({
      role,
      configDir: CONFIG_DIR,
      evalsDir: path.join(CONFIG_DIR, 'evals'),
      environment: 'offline',
      ...extra,
    });

  // Quanti esempi per ruolo: lo sceneggiatore ne ha cinque per la bozza e cinque per la stesura.
  it.each([
    ['moderator', 5],
    ['casting', 5],
    ['screenwriter', 10],
    ['shot_planner', 5],
    ['cinematographer', 5],
  ])(
    '%s: %i esempi, tutti con un ingresso valido per il suo ruolo',
    async (role, count) => {
      const result = await evaluate(role);

      expect(result.cases).toHaveLength(count);
      // Se un ingresso non fosse valido il ruolo fallirebbe prima di rispondere, senza risposta.
      expect(result.cases.every((esito) => esito.output !== undefined)).toBe(true);
      expect(result.totalCostUsd).toBeGreaterThan(0);
    },
    60_000,
  );

  it('le regole mordono: il fornitore finto approva sempre, quindi il moderatore sbaglia dove la risposta giusta è «no»', async () => {
    const { cases } = await evaluate('moderator');
    const byName = (part: string) => cases.find((esito) => esito.name.includes(part));
    const stopped = cases.filter((esito) => esito.name.startsWith('va fermato'));

    expect(byName('idea innocua')?.passed).toBe(true);
    expect(byName('persona famosa')?.passed).toBe(false);
    expect(byName('persona famosa')?.problems.join(' ')).toContain(
      '"allowed" dovrebbe essere false',
    );
    expect(stopped).toHaveLength(3);
    expect(stopped.every((esito) => !esito.passed)).toBe(true);
  }, 60_000);

  it('le regole mordono: la stesura che cita ciò che non le è stato dato non passa', async () => {
    const { cases } = await evaluate('screenwriter');
    const stesura = cases.find((esito) => esito.name.includes('l’oste non è stato scelto'));

    expect(stesura?.passed).toBe(false);
    expect(stesura?.problems.join(' ')).toContain(
      'che non c\'è in "characters[*].id" dell\'ingresso',
    );
    expect(cases.filter((esito) => esito.name.startsWith('bozza')).every((e) => !e.passed)).toBe(
      true,
    );
  }, 60_000);

  it('il rapporto si salva con esempi, risposte e scontrini, e ha data e ambiente nel nome', async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), 'filmzy-valutazioni-'));

    const result = await evaluate('shot_planner', { outputDir });
    const again = await evaluate('shot_planner', { outputDir });

    const files = await readdir(outputDir);
    expect(files).toHaveLength(2);
    expect(files.every((name) => /^eval-shot_planner-offline-.+\.json$/.test(name))).toBe(true);
    expect(result.reportFile).not.toBe(again.reportFile);
    const report = JSON.parse(await readFile(result.reportFile ?? '', 'utf8')) as {
      role: string;
      cases: unknown[];
      receipts: unknown[];
    };
    expect(report.role).toBe('shot_planner');
    expect(report.cases).toHaveLength(5);
    expect(report.receipts).toHaveLength(5);
  }, 60_000);

  it('se il rapporto non si può salvare il risultato resta, con il motivo', async () => {
    const blocker = path.join(await mkdtemp(path.join(tmpdir(), 'filmzy-valutazioni-')), 'file');
    await writeFile(blocker, 'non una cartella');

    // La «cartella» del rapporto è sotto un file: non si può creare.
    const result = await evaluate('moderator', { outputDir: path.join(blocker, 'dentro') });

    expect(result.cases).toHaveLength(5);
    expect(result.reportFile).toBeUndefined();
    expect(result.reportProblem).toBeTruthy();
  }, 60_000);

  it('il servizio da provare è un id di configurazione, mai un percorso', async () => {
    await expect(evaluate('moderator', { modelId: '../../fuori' })).rejects.toThrow();
  });

  it('con i fornitori veri si chiede prima di spendere, e se si dice no non parte nessuna chiamata', async () => {
    let asked: { estimate: number; calls: number } | undefined;

    await expect(
      evaluate('moderator', {
        confirm: (estimate, calls) => {
          asked = { estimate, calls };
          return Promise.resolve(false);
        },
      }),
    ).rejects.toThrow(/annullata/i);

    expect(asked?.calls).toBe(5);
    expect(asked?.estimate).toBeGreaterThan(0);
  });

  it('un esempio scritto male ferma la valutazione prima di spendere, e dice quale file', async () => {
    const evalsDir = await mkdtemp(path.join(tmpdir(), 'filmzy-esempi-'));
    await mkdir(path.join(evalsDir, 'moderator'));
    await writeFile(
      path.join(evalsDir, 'moderator', '01-buono.json'),
      JSON.stringify({
        name: 'buono',
        input: { text: 'Un faro.', context: 'idea', language: 'it' },
      }),
    );
    await writeFile(
      path.join(evalsDir, 'moderator', '02-rotto.json'),
      JSON.stringify({ name: 'rotto', input: {}, expect: { notcontains: ['x'] } }),
    );
    let asked = false;

    await expect(
      runEval({
        role: 'moderator',
        configDir: CONFIG_DIR,
        evalsDir,
        environment: 'offline',
        confirm: () => {
          asked = true;
          return Promise.resolve(true);
        },
      }),
    ).rejects.toThrow(/02-rotto\.json/);
    expect(asked).toBe(false);
  });
});
