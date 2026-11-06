import { PROJECT_URL, type About } from '@filmzy/contracts';

import { fetchAbout, openDataFolder } from '../api/about';
import { Brand } from '../components/Brand';
import { Notice, Panel } from '../components/ui';
import { openFolderFailureText } from '../films/sound/export-model';
import { useResource } from '../lib/use-resource';
import { describeError } from './messages';
import { useAction } from './use-action';

/** Le due pagine leggono la stessa cosa: versione e cartella dei dati. */
function useAbout() {
  return useResource(fetchAbout);
}

/** «I tuoi dati» (T6.2, D91): dove stanno i film. Cambiare cartella non c'è ancora. */
export function DataPage() {
  const { state } = useAbout();
  const opening = useAction();
  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;
  return (
    <DataBody
      about={state.data}
      busy={opening.busy}
      problem={opening.problem}
      onOpen={() => {
        opening.run(openDataFolder, openFolderFailureText);
      }}
    />
  );
}

export function DataBody({
  about,
  busy,
  problem,
  onOpen,
}: {
  about: About;
  busy: boolean;
  problem: string | undefined;
  onOpen: () => void;
}) {
  return (
    <>
      <Panel title="I tuoi dati">
        <p className="hint">Il tuo cinema abita qui. Nessun archivio Filmzy online.</p>
        <div className="field">
          <label htmlFor="data-dir">La cartella dei tuoi film · sola lettura</label>
          <input id="data-dir" type="text" readOnly value={about.dataDir} />
        </div>
        <p>I tuoi film restano qui anche quando aggiorni Filmzy.</p>
        <p className="hint">
          Qui trovi storie, personaggi, immagini, riprese e suoni. La cartella è sul tuo computer:
          prenditene cura come di ogni altro progetto.
        </p>
        <div className="actions">
          <button type="button" className="button" disabled={busy} onClick={onOpen}>
            Apri la cartella
          </button>
        </div>
        {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      </Panel>
      <Panel title="Una copia in più">
        <p className="hint">
          Per conservare o portare un film su un altro computer, salvane una copia dalla sua pagina.
        </p>
        <p className="hint">Le chiavi dei servizi non vengono incluse nella copia di un film.</p>
      </Panel>
    </>
  );
}

/** «Informazioni» (T6.2, D91): cos'è Filmzy, la licenza, e che niente va a chi l'ha fatto. */
export function AboutPage() {
  const { state } = useAbout();
  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;
  return <AboutBody about={state.data} />;
}

export function AboutBody({ about }: { about: About }) {
  return (
    <>
      <Panel title="Informazioni">
        <p className="hint">Un piccolo laboratorio di cinema, libero e sul tuo computer.</p>
        <Brand size="large" />
        <p>
          <strong>Filmzy {about.version}</strong> · Software libero (AGPL-3.0)
        </p>
        <p className="hint">
          Dall’idea ai titoli di coda, con gli strumenti che scegli tu. Filmzy è un’app desktop
          gratuita: non richiede account, abbonamenti o pagamenti a Filmzy.
        </p>
        <p className="hint">
          Filmzy non manda niente a chi l’ha fatto: nessuna statistica d’uso, nessun dato tuo.
        </p>
        <div className="actions">
          {/* Pagine del progetto: si aprono fuori dal programma, senza dirgli da dove si arriva. */}
          <a
            className="button"
            href={`${PROJECT_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
          >
            Leggi la licenza ↗
          </a>
          <a className="button" href={PROJECT_URL} target="_blank" rel="noreferrer">
            Visita il progetto su GitHub ↗
          </a>
        </div>
        <p className="hint">
          Filmzy cresce grazie a chi lo usa, segnala problemi e condivide idee. Un modo per
          contribuire arriverà presto.
        </p>
      </Panel>
      <Panel title="Uso responsabile">
        <p className="hint">
          Usa soltanto materiali di cui possiedi i diritti o che puoi utilizzare con permesso.
          Controlla i contenuti prima di condividerli e rendi trasparente l’uso dell’intelligenza
          artificiale.
        </p>
        <p className="hint">
          I file restano sul tuo computer. Per generare invii i contenuti necessari ai servizi
          scelti: costi, condizioni e responsabilità dipendono dai tuoi accordi con quei fornitori.
        </p>
      </Panel>
    </>
  );
}
