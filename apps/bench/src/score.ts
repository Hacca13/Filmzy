import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { BenchPlan } from '@filmzy/contracts';
import { loadBenchPlan } from '@filmzy/troupe';
import { z } from 'zod';

import { benchTakeSchema } from './run.js';

/**
 * I punteggi della prova (architettura §4.13): quanti take sono **usabili** e quanto costa un
 * secondo usabile. È il numero che serve a scegliere un modello: un servizio che costa la metà ma
 * sbaglia due take su tre non è più economico.
 */

const votesFileSchema = z.object({
  votante: z.string().optional(),
  voti: z.record(z.string(), z.record(z.string(), z.number())),
});

/** Un file di voti per votante: il report HTML ne produce uno a testa. */
export type VotesFile = z.infer<typeof votesFileSchema>;

export interface ModelScore {
  modelId: string;
  modelLabel: string;
  takes: number;
  usable: number;
  /** La media dei voti di tutti i votanti, su tutti i criteri. */
  averageScore: number | undefined;
  costUsd: number;
  usableSeconds: number;
  costPerUsableSecondUsd: number | undefined;
  /** Se ogni inquadratura ha abbastanza take usabili, come chiede il piano. */
  meetsSuccess: boolean;
}

export interface ScoreResult {
  plan: BenchPlan;
  voters: number;
  models: ModelScore[];
}

export async function scoreBench(runDir: string, planPath: string): Promise<ScoreResult> {
  const { plan, issues } = await loadBenchPlan(planPath);
  if (plan === undefined) {
    throw new Error(
      `Il piano non si è letto:\n${issues.map((issue) => `  • ${issue.message}`).join('\n')}`,
    );
  }

  const takesFile = path.join(runDir, 'take.json');
  const parsedTakes = z
    .array(benchTakeSchema)
    .safeParse(JSON.parse(await readFile(takesFile, 'utf8')));
  if (!parsedTakes.success) {
    throw new Error(
      `${takesFile} non è un elenco di take valido (${parsedTakes.error.issues.map((issue) => issue.message).join('; ')}).`,
    );
  }
  const takes = parsedTakes.data;

  const votes = await readVotes(runDir);
  const scores = new Map<string, ModelScore>();

  for (const take of takes) {
    const score = scores.get(take.modelId) ?? {
      modelId: take.modelId,
      modelLabel: take.modelLabel,
      takes: 0,
      usable: 0,
      averageScore: undefined,
      costUsd: 0,
      usableSeconds: 0,
      costPerUsableSecondUsd: undefined,
      meetsSuccess: false,
    };

    score.takes += 1;
    score.costUsd += take.costUsd ?? 0;

    const average = averageOf(votes, take.id);
    if (average !== undefined && average >= plan.voting.usable_threshold) {
      score.usable += 1;
      score.usableSeconds += take.seconds ?? plan.duration_s;
    }

    scores.set(take.modelId, score);
  }

  // La media dei voti e il costo per secondo usabile si calcolano alla fine, sui totali.
  for (const score of scores.values()) {
    const averages = takes
      .filter((take) => take.modelId === score.modelId)
      .map((take) => averageOf(votes, take.id))
      .filter((value): value is number => value !== undefined);

    score.averageScore =
      averages.length === 0
        ? undefined
        : averages.reduce((total, value) => total + value, 0) / averages.length;
    score.costPerUsableSecondUsd =
      score.usableSeconds === 0 ? undefined : score.costUsd / score.usableSeconds;
    score.meetsSuccess = plan.shots.every((shot) => {
      const usable = takes.filter(
        (take) =>
          take.modelId === score.modelId &&
          take.shotId === shot.id &&
          (averageOf(votes, take.id) ?? 0) >= plan.voting.usable_threshold,
      ).length;
      return usable >= plan.success.usable_takes_per_shot;
    });
  }

  return { plan, voters: votes.length, models: [...scores.values()] };
}

/** Tutti i file di voti della cartella: `voti.json`, `voti-1.json`, `voti-anna.json`… */
async function readVotes(runDir: string): Promise<VotesFile[]> {
  const files = (await readdir(runDir)).filter(
    (name) => name.startsWith('voti') && name.endsWith('.json'),
  );

  const votes: VotesFile[] = [];
  for (const name of files) {
    const raw: unknown = JSON.parse(await readFile(path.join(runDir, name), 'utf8'));
    const parsed = votesFileSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `${name}: non è un file di voti valido (${parsed.error.issues.map((issue) => issue.message).join('; ')}).`,
      );
    }
    votes.push(parsed.data);
  }
  return votes;
}

/** La media dei voti di tutti i votanti per un take: `undefined` se nessuno l'ha votato. */
function averageOf(votes: readonly VotesFile[], takeId: string): number | undefined {
  const values = votes.flatMap((file) => Object.values(file.voti[takeId] ?? {}));
  if (values.length === 0) return undefined;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
