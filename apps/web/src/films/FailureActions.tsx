import { ChangeService } from '../components/ChangeService';
import { COST_NOTE, failureOf } from './failure';
import type { Generation } from './generation';

/**
 * Cosa si può fare dopo che una generazione non è riuscita (T4.5): «Riprova», «Cambia servizio», un
 * collegamento alle impostazioni dove si risolve. Dopo un rifiuto del contenuto non c'è niente da
 * premere: si cambia la richiesta e si crea un nuovo tentativo (D36). Si mostra solo per l'ultimo
 * tentativo: quelli di prima sono storia.
 *
 * «Riprova» e «Cambia servizio» usano la stessa scelta del pulsante «Crea…» (`generation`): non si
 * prova mai un altro servizio da soli, lo sceglie l'utente.
 */
export function FailureActions<T>({
  code,
  generation,
  busy,
}: {
  code: string | undefined;
  generation: Generation<T>;
  busy: boolean;
}) {
  const failure = failureOf(code);
  if (failure.actions.length === 0 && !failure.mayHaveCost) return null;

  return (
    <div className="failure-actions">
      {failure.actions.length === 0 ? null : (
        <div className="actions">
          {failure.actions.map((action) => {
            switch (action.kind) {
              case 'retry':
                return (
                  <button
                    key="retry"
                    type="button"
                    className="button"
                    data-kind="primary"
                    disabled={busy || generation.chosen === undefined}
                    onClick={generation.run}
                  >
                    Riprova
                  </button>
                );
              case 'change_service':
                return (
                  <ChangeService
                    key="change"
                    options={generation.choices}
                    selectedId={generation.chosen?.modelId}
                    loading={generation.options.state.status === 'loading'}
                    onSelect={generation.setModelId}
                  />
                );
              case 'link':
                return (
                  <a key={action.href} className="button" data-kind="primary" href={action.href}>
                    {action.label}
                  </a>
                );
            }
          })}
        </div>
      )}
      {failure.mayHaveCost ? <p className="hint">{COST_NOTE}</p> : null}
    </div>
  );
}
