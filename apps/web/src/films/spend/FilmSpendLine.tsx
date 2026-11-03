import { useCallback } from 'react';

import { fetchFilmSpend } from '../../api/spend';
import { formatUsd } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { spendHref } from '../routes';

/**
 * Nella pagina del film: quanto è costato finora e il modo di vedere come si divide (T4.7, D30). Se la
 * spesa non si legge il collegamento resta lo stesso: il dettaglio dirà cosa non va.
 */
export function FilmSpendLine({ filmId }: { filmId: string }) {
  const load = useCallback((signal: AbortSignal) => fetchFilmSpend(filmId, signal), [filmId]);
  const { state } = useResource(load);
  const total = state.status === 'ready' ? state.data.totalUsd : undefined;

  return (
    <p className="hint">
      {total === undefined ? null : <>Speso finora: {formatUsd(total)} · </>}
      <a href={spendHref(filmId)}>Quanto ho speso</a>
    </p>
  );
}
