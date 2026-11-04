import type { ContinuityFlag } from '@filmzy/contracts';

import { Chip } from '../../components/ui';

/**
 * Un giallo di continuità, di un'inquadratura o di una scena: «Da rivedere», oppure «Avviso leggero» con
 * un tono più calmo quando il server dice che è leggero (R4, R9), e il motivo scritto per esteso. Sempre
 * con parole, mai solo colore.
 */
export function FlagNote({ flag }: { flag: ContinuityFlag }) {
  return (
    <div className="shot-flag">
      {flag.light ? (
        <Chip tone="info">Avviso leggero</Chip>
      ) : (
        <Chip tone="warning">Da rivedere</Chip>
      )}
      <p className="hint">{flag.reason}</p>
    </div>
  );
}
