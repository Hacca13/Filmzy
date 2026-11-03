import type { FilmSpend, ProviderSpend, SpendOverview } from '@filmzy/contracts';
import { useCallback } from 'react';

import { fetchFilmSpend, fetchSpend } from '../../api/spend';
import { Notice, Panel } from '../../components/ui';
import { formatUsd } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { spendBadge, spendLine } from '../../settings/spend/model';
import { filmHref } from '../routes';
import { barShares, callsText, monthCounts, monthTitle, remainingText } from './spend-model';

/**
 * «Quanto ho speso» (T4.7, D30, §7): quanto è costato il film dall'inizio, quanto si è speso questo
 * mese in tutto, e come si divide la spesa — per film, per ruolo, per servizio, e per fornitore rispetto
 * al suo limite. Tutto viene dagli scontrini e lo calcola il server: qui si legge e si mostra. I
 * limiti non si cambiano qui ma in «Impostazioni › Spese e tetti», dove sono sempre stati.
 */
export function FilmSpendPage({ filmId }: { filmId: string }) {
  const loadFilm = useCallback((signal: AbortSignal) => fetchFilmSpend(filmId, signal), [filmId]);
  const film = useResource(loadFilm);
  const overview = useResource(fetchSpend);

  if (film.state.status === 'error') {
    return <Notice tone="error">{describeError(film.state.error)}</Notice>;
  }
  if (film.state.status === 'loading' || overview.state.status === 'loading') {
    return <p className="hint">Un attimo…</p>;
  }
  // Il dettaglio del film non dipende dal resto: se il riepilogo del mese non si legge, si dice e il film si vede lo stesso.
  return (
    <SpendView
      film={film.state.data}
      overview={overview.state.status === 'ready' ? overview.state.data : undefined}
      overviewProblem={
        overview.state.status === 'error' ? describeError(overview.state.error) : undefined
      }
    />
  );
}

export function SpendView({
  film,
  overview,
  overviewProblem,
}: {
  film: FilmSpend;
  /** Il riepilogo del mese e dei film; manca se non si è potuto leggere (e allora c'è `overviewProblem`). */
  overview: SpendOverview | undefined;
  overviewProblem?: string | undefined;
}) {
  return (
    <section className="film-page spend-page">
      <p className="breadcrumb">
        <a href="#/">I miei film</a> › <a href={filmHref(film.projectId)}>{film.title}</a> ›{' '}
        <strong>Quanto ho speso</strong>
      </p>
      <p className="eyebrow">
        SPESE{overview === undefined ? '' : ` · ${monthTitle(overview.monthStart)}`}
      </p>
      <h1>Quanto ho speso</h1>
      <p className="hint">
        Le spese dei tuoi servizi, raccolte qui. Filmzy è gratuito: gli addebiti arrivano
        direttamente dai fornitori.
      </p>

      <div className="spend-totals">
        <section className="panel" aria-label="Questo film">
          <h2>Questo film</h2>
          <p className="spend-total">{formatUsd(film.totalUsd)}</p>
          <p className="hint">{film.title} · dall’inizio del film</p>
          {film.monthUsd > 0 ? (
            <p className="hint">Di cui {formatUsd(film.monthUsd)} questo mese</p>
          ) : null}
        </section>
        {overview === undefined ? null : (
          <section className="panel" aria-label="Tutti i film, questo mese">
            <h2>Tutti i film, questo mese</h2>
            <p className="spend-total">{formatUsd(overview.filmsMonthUsd)}</p>
            <p className="hint">{monthCounts(overview.filmsMonth, overview.servicesMonth)}</p>
          </section>
        )}
      </div>
      {overviewProblem === undefined ? null : <Notice tone="error">{overviewProblem}</Notice>}

      {overview === undefined ? null : (
        <Breakdown
          title="Per film · questo mese"
          empty="Questo mese non hai ancora speso niente."
          total={`Totale del mese: ${formatUsd(overview.filmsMonthUsd)}`}
          items={overview.films
            .filter((line) => line.monthUsd > 0)
            .map((line) => ({ key: line.projectId, name: line.title, usd: line.monthUsd }))}
        />
      )}
      <Breakdown
        title="Per ruolo · questo film"
        empty="Per questo film non hai ancora speso niente."
        total={`Totale del film: ${formatUsd(film.totalUsd)}`}
        items={film.roles.map((role) => ({
          key: role.role,
          name: role.label,
          usd: role.spentUsd,
          detail: callsText(role.calls),
        }))}
      />
      <Breakdown
        title="Per servizio · questo film"
        empty="Per questo film non hai ancora speso niente."
        total={`Totale del film: ${formatUsd(film.totalUsd)}`}
        items={film.services.map((service) => ({
          key: service.modelId,
          name: `${service.label} · ${service.providerLabel}`,
          usd: service.spentUsd,
          detail: callsText(service.calls),
        }))}
      />

      {overview === undefined ? null : <ProvidersPanel overview={overview} />}
      <p className="hint">Salvato sul tuo computer</p>
    </section>
  );
}

/** Sotto mezzo centesimo la differenza è un arrotondamento, non una spesa. */
const MIN_OTHER_USD = 0.005;

/** Il mese di ogni fornitore rispetto al suo limite, con il totale di tutto ciò che si è speso. */
function ProvidersPanel({ overview }: { overview: SpendOverview }) {
  // Le prove fatte dalle impostazioni costano ma non sono di nessun film: il conto torna dicendolo.
  const otherUsd = overview.totalMonthUsd - overview.filmsMonthUsd;

  return (
    <Panel title="Questo mese, per servizio">
      {overview.providers.length === 0 ? (
        <p className="hint">Non hai ancora collegato nessun servizio.</p>
      ) : (
        overview.providers.map((provider) => (
          <ProviderLine key={provider.connectionId} provider={provider} />
        ))
      )}
      <p className="spend-sum">Totale servizi del mese: {formatUsd(overview.totalMonthUsd)}</p>
      {otherUsd < MIN_OTHER_USD ? null : (
        <p className="hint">
          Di questi, {formatUsd(otherUsd)} non sono di nessun film: sono le prove fatte dalle
          impostazioni.
        </p>
      )}
      <p className="hint">
        ✦ Imposta un limite di spesa anche nel pannello di ogni servizio: lì vale anche quando
        Filmzy è chiuso. I limiti di Filmzy si cambiano in{' '}
        <a href="#/impostazioni/spese">Impostazioni › Spese e tetti</a>.
      </p>
    </Panel>
  );
}

interface BreakdownItem {
  key: string;
  name: string;
  usd: number;
  detail?: string;
}

/** Un elenco di voci con la barra proporzionale alla più cara. */
function Breakdown({
  title,
  empty,
  total,
  items,
}: {
  title: string;
  empty: string;
  total: string;
  items: BreakdownItem[];
}) {
  const shares = barShares(items.map((item) => item.usd));

  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p className="hint">{empty}</p>
      ) : (
        <>
          {items.map((item, index) => (
            <div key={item.key} className="spend-item">
              <div className="spend-item-head">
                <span>
                  {item.name}
                  {item.detail === undefined ? null : (
                    <span className="hint"> · {item.detail}</span>
                  )}
                </span>
                <strong>{formatUsd(item.usd)}</strong>
              </div>
              <progress aria-label={item.name} max={100} value={shares[index] ?? 0} />
            </div>
          ))}
          <p className="spend-sum">{total}</p>
        </>
      )}
    </Panel>
  );
}

/** Un fornitore: quanto ha speso questo mese e, se c'è un limite, a che punto è. */
function ProviderLine({ provider }: { provider: ProviderSpend }) {
  const badge = spendBadge(provider);
  const remaining = remainingText(provider.spentUsd, provider.capUsd);

  return (
    <div className="spend-item">
      <div className="spend-item-head">
        <span>
          <strong>{provider.label}</strong> · {spendLine(provider)}
          {badge === undefined ? null : (
            <span className="badge" data-tone={badge.tone === 'reached' ? 'accent' : 'plain'}>
              {badge.text}
            </span>
          )}
        </span>
        {remaining === undefined ? null : <span className="hint">{remaining}</span>}
      </div>
      {provider.capUsd === undefined || provider.percent === undefined ? (
        <p className="hint">
          Nessun limite impostato · senza limite, il servizio continua a funzionare.
        </p>
      ) : (
        <progress
          aria-label={`Spesa di ${provider.label}`}
          max={100}
          value={Math.min(100, provider.percent)}
        />
      )}
    </div>
  );
}
