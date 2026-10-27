import type {
  ProviderSpend,
  SpendBreach,
  SpendLevel,
  SpendOverview,
  UserSettings,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { ConfigSource, SpendCheckInput, SpendGuard, TroupeConfig } from '@filmzy/troupe';

/** Da qui in su un limite «sta per finire» (D36). */
const WARNING_PERCENT = 80;

/** Per non scambiare un arrotondamento dei decimali per un superamento. */
const EPSILON = 1e-9;

export interface SpendLedgerOptions {
  receipts: ReceiptStore;
  configSource: ConfigSource;
  now?: () => Date;
}

/**
 * Il registro della spesa (T3.1, D30): somma gli scontrini e li confronta coi limiti dell'utente.
 * È il `SpendGuard` che la troupe interroga prima di ogni chiamata, e lo stesso che alimenta la
 * pagina delle spese: un conto solo, così non possono dire cose diverse.
 *
 * I limiti sono impostazioni, non muri, e **nessuno è preimpostato** (D36): senza limiti accesi non
 * si blocca niente. Un valore scritto nella release è solo un valore iniziale; quello delle scelte
 * dell'utente lo sostituisce (§4.3).
 */
export class SpendLedger implements SpendGuard {
  private readonly now: () => Date;

  constructor(private readonly options: SpendLedgerOptions) {
    this.now = options.now ?? (() => new Date());
  }

  /** Il primo limite che la chiamata supererebbe: mensile del fornitore, poi film, poi «conferma sopra». */
  async check(input: SpendCheckInput): Promise<SpendBreach | undefined> {
    const loaded = await this.options.configSource.load();
    if (loaded.config === undefined) return undefined;
    const { config, settings } = loaded;
    const estimated = input.estimatedCostUsd;

    const monthlyCap = monthlyCapOf(config, settings, input.connectionId);
    if (monthlyCap !== undefined) {
      const spent =
        this.options.receipts.spentByConnectionSince(this.monthStart())[input.connectionId] ?? 0;
      if (spent + estimated > monthlyCap + EPSILON) {
        return {
          limit: 'monthly_cap',
          limitUsd: monthlyCap,
          spentUsd: spent,
          estimatedUsd: estimated,
        };
      }
    }

    const filmBudget = filmBudgetOf(config, settings);
    if (filmBudget !== undefined && input.projectId !== undefined) {
      const spent = this.options.receipts.spentOnProject(input.projectId);
      if (spent + estimated > filmBudget + EPSILON) {
        return {
          limit: 'film_budget',
          limitUsd: filmBudget,
          spentUsd: spent,
          estimatedUsd: estimated,
        };
      }
    }

    const confirmAbove = confirmAboveOf(config, settings);
    if (confirmAbove !== undefined && estimated > confirmAbove + EPSILON) {
      return {
        limit: 'confirm_above',
        limitUsd: confirmAbove,
        spentUsd: 0,
        estimatedUsd: estimated,
      };
    }
    return undefined;
  }

  /** Quanto speso nel mese per fornitore, con quanto manca al limite, più i limiti e i film. */
  async overview(): Promise<SpendOverview | undefined> {
    const loaded = await this.options.configSource.load();
    if (loaded.config === undefined) return undefined;
    const { config, settings } = loaded;

    const monthStart = this.monthStart();
    const spentByConnection = this.options.receipts.spentByConnectionSince(monthStart);
    const known = new Set(Object.keys(config.connections));

    // Un fornitore non più nella configurazione ma con spesa nel mese si mostra lo stesso: i soldi sono andati.
    const ids = [
      ...Object.keys(config.connections),
      ...Object.keys(spentByConnection).filter((id) => id !== '' && !known.has(id)),
    ];
    const providers = ids.flatMap((id) => {
      const connection = config.connections[id];
      const spentUsd = spentByConnection[id] ?? 0;
      return connection?.enabled === false && spentUsd === 0
        ? []
        : [
            providerSpend(
              id,
              connection?.label ?? id,
              spentUsd,
              monthlyCapOf(config, settings, id),
            ),
          ];
    });

    const filmBudgetUsd = filmBudgetOf(config, settings);
    const confirmAboveUsd = confirmAboveOf(config, settings);
    return {
      monthStart: monthStart.toISOString(),
      totalMonthUsd: Object.values(spentByConnection).reduce((sum, spent) => sum + spent, 0),
      providers,
      ...(filmBudgetUsd === undefined ? {} : { filmBudgetUsd }),
      ...(confirmAboveUsd === undefined ? {} : { confirmAboveUsd }),
      films: Object.entries(this.options.receipts.spentByProject())
        .map(([projectId, spentUsd]) => ({ projectId, spentUsd }))
        .sort((a, b) => b.spentUsd - a.spentUsd),
    };
  }

  /** L'inizio del mese **dell'utente** (fuso del suo computer): il mese di cui parla chi guarda la spesa. */
  private monthStart(): Date {
    const now = this.now();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function providerSpend(
  connectionId: string,
  label: string,
  spentUsd: number,
  capUsd: number | undefined,
): ProviderSpend {
  if (capUsd === undefined) return { connectionId, label, spentUsd, level: 'none' };

  const percent = (spentUsd / capUsd) * 100;
  const level: SpendLevel =
    percent >= 100 ? 'reached' : percent >= WARNING_PERCENT ? 'warning' : 'ok';
  return { connectionId, label, spentUsd, capUsd, percent: Math.round(percent * 10) / 10, level };
}

function monthlyCapOf(
  config: TroupeConfig,
  settings: UserSettings | undefined,
  connectionId: string,
): number | undefined {
  return (
    settings?.spendCaps.monthlyByConnection?.[connectionId] ??
    config.connections[connectionId]?.monthly_cap_usd
  );
}

function filmBudgetOf(
  config: TroupeConfig,
  settings: UserSettings | undefined,
): number | undefined {
  return settings?.spendCaps.filmBudgetUsd ?? config.limits.film_budget_usd;
}

function confirmAboveOf(
  config: TroupeConfig,
  settings: UserSettings | undefined,
): number | undefined {
  return settings?.spendCaps.confirmAboveUsd ?? config.limits.confirm_above_usd;
}
