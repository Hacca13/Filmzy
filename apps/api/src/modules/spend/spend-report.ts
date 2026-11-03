import type {
  FilmSpend,
  FilmSpendLine,
  RoleSpend,
  ServiceSpend,
  SpendOverview,
} from '@filmzy/contracts';
import type { ProjectStore, ReceiptStore, SpendRow } from '@filmzy/db';
import type { ConfigSource, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { PROJECT_STORE } from '../projects/tokens.js';
import { CONFIG_SOURCE, RECEIPT_STORE, SPEND_LEDGER } from '../troupe/tokens.js';
import type { SpendLedger } from './spend-ledger.js';

/** Come si chiama un film che non c'è più ma ha lasciato degli scontrini (le prove, un archivio vecchio). */
const MISSING_FILM_TITLE = 'Un film che non c’è più';

const byCostThenName = <T extends { spentUsd: number }>(
  a: T,
  b: T,
  nameOf: (item: T) => string,
): number => b.spentUsd - a.spentUsd || nameOf(a).localeCompare(nameOf(b), 'it');

/** Somma le righe di spesa per una chiave: la stessa riga di scontrini può stare in più viste. */
function sumBy<K extends string>(
  rows: readonly SpendRow[],
  keyOf: (row: SpendRow) => K,
): Map<K, { spentUsd: number; calls: number; rows: SpendRow[] }> {
  const groups = new Map<K, { spentUsd: number; calls: number; rows: SpendRow[] }>();
  for (const row of rows) {
    const group = groups.get(keyOf(row)) ?? { spentUsd: 0, calls: 0, rows: [] };
    group.spentUsd += row.spentUsd;
    group.calls += row.calls;
    group.rows.push(row);
    groups.set(keyOf(row), group);
  }
  return groups;
}

/**
 * I film dell'elenco (T4.7): ogni film con la spesa dall'inizio e quella del mese. Un film che non ha
 * speso niente non compare. Prima quelli che hanno speso nel mese, dal più caro: è ciò che interessa
 * a chi guarda «Quanto ho speso».
 */
export function filmLines(
  allTime: readonly SpendRow[],
  month: readonly SpendRow[],
  titleOf: (projectId: string) => string | undefined,
): FilmSpendLine[] {
  const filmOf = (row: SpendRow) => row.projectId ?? '';
  const total = sumBy(
    allTime.filter((row) => row.projectId !== null),
    filmOf,
  );
  const monthly = sumBy(
    month.filter((row) => row.projectId !== null),
    filmOf,
  );

  return [...total.entries()]
    .map(([projectId, spent]) => ({
      projectId,
      title: titleOf(projectId) ?? MISSING_FILM_TITLE,
      spentUsd: spent.spentUsd,
      monthUsd: monthly.get(projectId)?.spentUsd ?? 0,
    }))
    .filter((line) => line.spentUsd > 0)
    .sort((a, b) => b.monthUsd - a.monthUsd || byCostThenName(a, b, (line) => line.title));
}

/** La spesa di un film per ruolo e per servizio, con i nomi che vede l'utente (T4.7). */
export function filmBreakdown(
  rows: readonly SpendRow[],
  config: TroupeConfig | undefined,
): Pick<FilmSpend, 'roles' | 'services'> {
  const roleLabel = (role: string) => config?.roles[role]?.label ?? role;
  const providerLabel = (connectionId: string) =>
    config?.connections[connectionId]?.label ??
    (connectionId === '' ? 'Sconosciuto' : connectionId);
  const serviceLabel = (modelId: string) => config?.models[modelId]?.label ?? modelId;

  const roles: RoleSpend[] = [...sumBy(rows, (row) => row.role).entries()]
    .map(([role, group]) => ({
      role,
      label: roleLabel(role),
      spentUsd: group.spentUsd,
      calls: group.calls,
    }))
    .filter((item) => item.spentUsd > 0 || item.calls > 0)
    .sort((a, b) => byCostThenName(a, b, (item) => item.label));

  const services: ServiceSpend[] = [...sumBy(rows, (row) => row.modelId).entries()].flatMap(
    ([modelId, group]) => {
      // Gli scontrini più vecchi non dicevano il fornitore: se un altro lo dice, vale quello.
      const connectionId = group.rows.find((row) => row.connectionId !== '')?.connectionId ?? '';
      return group.spentUsd > 0 || group.calls > 0
        ? [
            {
              modelId,
              label: serviceLabel(modelId),
              providerLabel: providerLabel(connectionId),
              spentUsd: group.spentUsd,
              calls: group.calls,
            },
          ]
        : [];
    },
  );
  services.sort((a, b) => byCostThenName(a, b, (item) => item.label));

  return { roles, services };
}

/**
 * «Quanto ho speso» (T4.7, D30): mette insieme gli scontrini, i titoli dei film e i nomi della
 * configurazione. Il conto è quello del registro della spesa (stesse regole: il costo vero, altrimenti
 * la stima, e una chiamata fallita non spende), quindi i totali non possono dire cose diverse.
 */
@Injectable()
export class SpendReport {
  constructor(
    @Inject(SPEND_LEDGER) private readonly ledger: SpendLedger,
    @Inject(RECEIPT_STORE) private readonly receipts: ReceiptStore,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(PROJECT_STORE) private readonly projects: ProjectStore,
  ) {}

  async overview(): Promise<SpendOverview> {
    const base = await this.ledger.overview();
    if (base === undefined) throw domainError(404, 'not_found');

    const films = filmLines(
      this.receipts.spendRows(),
      this.receipts.spendRows({ since: new Date(base.monthStart) }),
      (projectId) => this.projects.get(projectId)?.title,
    );
    const monthFilms = films.filter((film) => film.monthUsd > 0);
    return {
      ...base,
      filmsMonth: monthFilms.length,
      filmsMonthUsd: monthFilms.reduce((sum, film) => sum + film.monthUsd, 0),
      films,
    };
  }

  async film(projectId: string): Promise<FilmSpend> {
    const project = this.projects.get(projectId);
    const rows = this.receipts.spendRows({ projectId });
    // Un film sparito ma con scontrini si può ancora guardare: i soldi sono andati lo stesso.
    if (project === undefined && rows.length === 0) {
      throw domainError(404, 'not_found', { details: { field: 'projectId' } });
    }

    const loaded = await this.configSource.load();
    const monthRows = this.receipts.spendRows({ projectId, since: this.ledger.monthStart() });

    return {
      projectId,
      title: project?.title ?? MISSING_FILM_TITLE,
      totalUsd: rows.reduce((sum, row) => sum + row.spentUsd, 0),
      monthUsd: monthRows.reduce((sum, row) => sum + row.spentUsd, 0),
      ...filmBreakdown(rows, loaded.config),
    };
  }
}
