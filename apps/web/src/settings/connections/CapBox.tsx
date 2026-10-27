import type { ConnectionsOverview, ProviderState } from '@filmzy/contracts';

import { setMonthlyCap } from '../../api/connections';
import { Notice } from '../../components/ui';
import { UsdLimitBox } from '../spend/UsdLimitBox';
import { useAction } from '../use-action';

interface Props {
  provider: ProviderState;
  onOverview: (overview: ConnectionsOverview) => void;
}

/**
 * Il limite di spesa mensile di un fornitore (D30, D36): facoltativo, **nessuno è preimpostato**.
 * Vuoto vuol dire nessun limite. Il promemoria ricorda che il fornitore ha un suo pannello dove
 * metterne uno anche lì: è la difesa che vale anche se Filmzy è chiuso.
 */
export function CapBox({ provider, onOverview }: Props) {
  const action = useAction();

  return (
    <>
      <UsdLimitBox
        id={`cap-${provider.connectionId}`}
        label="Limite di spesa mensile (facoltativo)"
        placeholder="Importo in $ · lascia vuoto per nessun limite"
        hint={`Conviene impostare un limite di spesa anche nel pannello di ${provider.label}: lì vale anche quando Filmzy è chiuso.`}
        value={provider.monthlyCapUsd}
        busy={action.busy}
        onSave={(usd) => {
          action.run(async () => {
            onOverview(await setMonthlyCap(provider.connectionId, usd));
          });
        }}
      />
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </>
  );
}
