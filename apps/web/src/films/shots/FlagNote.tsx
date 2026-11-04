import type { ContinuityFlag } from '@filmzy/contracts';

import { Chip } from '../../components/ui';

interface Props {
  flag: ContinuityFlag;
  /** Il pulsante che risolve questo giallo, se da qui si può fare qualcosa (deciso dal server con `flag.fix`). */
  fixLabel?: string | undefined;
  onFix?: (() => void) | undefined;
  /** «Ignora» o «Rimetti»: senza, il giallo si legge e basta. */
  onIgnored?: ((ignored: boolean) => void) | undefined;
  busy?: boolean;
}

/**
 * Un giallo di continuità, di un'inquadratura o di una scena: «Da rivedere», oppure «Avviso leggero» con
 * un tono più calmo quando il server dice che è leggero (R4, R9), e il motivo scritto per esteso. Sempre
 * con parole, mai solo colore. Niente si rifà da solo (§8): decide l'utente, che può anche ignorarlo e
 * cambiare idea (T5.3).
 */
export function FlagNote({ flag, fixLabel, onFix, onIgnored, busy = false }: Props) {
  if (flag.ignored) {
    return (
      <div className="shot-flag" data-ignored="true">
        <Chip tone="info">Ignorato</Chip>
        <p className="hint">{flag.reason}</p>
        {onIgnored === undefined ? null : (
          <div className="actions">
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                onIgnored(false);
              }}
            >
              Rimetti
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shot-flag">
      {flag.light ? (
        <Chip tone="info">Avviso leggero</Chip>
      ) : (
        <Chip tone="warning">Da rivedere</Chip>
      )}
      <p className="hint">{flag.reason}</p>
      {onFix === undefined && onIgnored === undefined ? null : (
        <div className="actions">
          {onFix === undefined || fixLabel === undefined ? null : (
            <button type="button" className="button" disabled={busy} onClick={onFix}>
              {fixLabel}
            </button>
          )}
          {onIgnored === undefined ? null : (
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                onIgnored(true);
              }}
            >
              Ignora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
