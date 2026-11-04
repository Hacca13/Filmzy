import type { ContinuityFlag } from '@filmzy/contracts';

import { Chip } from '../../components/ui';

interface Props {
  flag: Pick<ContinuityFlag, 'light' | 'reason' | 'ignored'>;
  /** Il pulsante che risolve questo giallo, se da qui si può fare qualcosa (deciso dal server con `flag.fix`). */
  fix?: { label: string; run: () => void } | undefined;
  /** «Ignora» o «Rimetti»: senza, il giallo si legge e basta. */
  onIgnored?: ((ignored: boolean) => void) | undefined;
  busy?: boolean;
}

/** Il chip di un giallo: sempre con parole, mai solo colore. */
function FlagChip({ flag }: Pick<Props, 'flag'>) {
  if (flag.ignored) return <Chip tone="info">Ignorato</Chip>;
  return flag.light ? (
    <Chip tone="info">Avviso leggero</Chip>
  ) : (
    <Chip tone="warning">Da rivedere</Chip>
  );
}

/**
 * Un giallo di continuità, di un'inquadratura o di una scena: «Da rivedere», oppure «Avviso leggero» con
 * un tono più calmo quando il server dice che è leggero (R4, R9), e il motivo scritto per esteso. Niente
 * si rifà da solo (§8): decide l'utente, che può anche ignorarlo e cambiare idea (T5.3).
 */
export function FlagNote({ flag, fix, onIgnored, busy = false }: Props) {
  const shownFix = flag.ignored ? undefined : fix;
  return (
    <div className="shot-flag">
      <FlagChip flag={flag} />
      <p className="hint">{flag.reason}</p>
      {shownFix === undefined && onIgnored === undefined ? null : (
        <div className="actions">
          {shownFix === undefined ? null : (
            <button type="button" className="button" disabled={busy} onClick={shownFix.run}>
              {shownFix.label}
            </button>
          )}
          {onIgnored === undefined ? null : (
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                onIgnored(!flag.ignored);
              }}
            >
              {flag.ignored ? 'Rimetti' : 'Ignora'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
