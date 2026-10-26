import {
  troupeConfigSchema,
  type DraftView,
  type PublishResponse,
  type SecretsView,
} from '@filmzy/contracts';
import { useMemo, useState } from 'react';

import { fetchSecrets } from '../../api/secrets';
import {
  discardDraft,
  fetchDraft,
  publishDraft,
  resetDraftToProgramValues,
  saveDraft,
} from '../../api/troupe-config';
import { IssueList, Notice, Panel } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { KeyStatus } from './KeyStatus';
import { SectionPanel } from './SectionPanel';
import { orphanIssues, SECTIONS } from './sections';

/**
 * Impostazioni › Avanzate (T2.3): la configurazione tecnica del programma, in una **bozza** che si
 * modifica, si salva e si pubblica (architettura §4.5). La pagina mostra e invia: i controlli di
 * merito li fa il server con lo stesso validatore di `pnpm troupe check`.
 */
export function AdvancedPage() {
  const draft = useResource(fetchDraft);
  const secrets = useResource(fetchSecrets);

  if (draft.state.status === 'error') {
    return <Notice tone="error">{describeError(draft.state.error)}</Notice>;
  }
  if (secrets.state.status === 'error') {
    return <Notice tone="error">{describeError(secrets.state.error)}</Notice>;
  }
  if (draft.state.status === 'loading' || secrets.state.status === 'loading') {
    return <p className="hint">Un attimo…</p>;
  }

  return (
    <Editor
      view={draft.state.data}
      onView={draft.setData}
      secrets={secrets.state.data}
      onSecrets={secrets.setData}
    />
  );
}

interface EditorProps {
  view: DraftView;
  onView: (view: DraftView) => void;
  secrets: SecretsView;
  onSecrets: (secrets: SecretsView) => void;
}

type Confirmation = 'discard' | 'reset';

const CONFIRMATIONS: Record<Confirmation, string> = {
  discard: 'Butti via tutte le modifiche e torni alla configurazione attiva. Vuoi farlo?',
  reset: 'La bozza diventa quella che arriva col programma, e perdi le modifiche. Vuoi farlo?',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' });
}

function Editor({ view, onView, secrets, onSecrets }: EditorProps) {
  const [config, setConfig] = useState(view.config);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [confirming, setConfirming] = useState<Confirmation>();
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<PublishResponse>();

  // Il confronto è sul testo: la bozza che torna dal server ha le stesse chiavi nello stesso ordine.
  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(view.config),
    [config, view.config],
  );
  const valid = useMemo(() => troupeConfigSchema.safeParse(config).success, [config]);

  const fail = (error: unknown) => {
    setProblem(describeError(error));
  };

  const show = (next: DraftView) => {
    onView(next);
    setConfig(next.config);
    // Le connessioni possono essere cambiate: lo stato delle chiavi si rilegge.
    fetchSecrets().then(onSecrets, fail);
  };

  const run = (action: () => Promise<DraftView>) => {
    setBusy(true);
    setProblem(undefined);
    setOutcome(undefined);
    setConfirming(undefined);
    action()
      .then(show, fail)
      .finally(() => {
        setBusy(false);
      });
  };

  const publish = () => {
    setBusy(true);
    setProblem(undefined);
    publishDraft(note)
      .then((result) => {
        setOutcome(result);
        if (result.release === undefined) return undefined;
        setPublishing(false);
        setNote('');
        return fetchDraft().then(show);
      })
      .catch(fail)
      .finally(() => {
        setBusy(false);
      });
  };

  const unpublished = dirty || view.hasUnpublishedChanges;

  return (
    <>
      <Panel title="Configurazione attiva">
        <p className="hint">
          {view.activeRelease === undefined
            ? 'Non c’è ancora nessuna configurazione pubblicata.'
            : `Attiva dal ${formatDate(view.activeRelease.activatedAt ?? view.activeRelease.createdAt)}${view.activeRelease.note === undefined ? '' : ` · ${view.activeRelease.note}`}`}
        </p>
        <p className="hint">
          Non cambia finché non pubblichi la bozza qui sotto. Il programma la usa subito, senza
          riavviarsi.
        </p>
      </Panel>

      {unpublished ? (
        <Notice tone="info">
          {dirty ? 'Hai modifiche non salvate.' : 'Hai modifiche non pubblicate.'}
        </Notice>
      ) : null}
      {valid ? null : (
        <Notice tone="error">
          Qualche campo non è valido. Apri le voci segnate e correggi i campi in rosso.
        </Notice>
      )}
      <IssueList issues={[...orphanIssues(view.issues)]} />

      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || !dirty || !valid}
          onClick={() => {
            run(() => saveDraft(config));
          }}
        >
          Salva la bozza
        </button>
        <button
          type="button"
          className="button"
          disabled={busy || dirty || !view.hasUnpublishedChanges}
          onClick={() => {
            setPublishing(true);
          }}
        >
          Pubblica
        </button>
        <button
          type="button"
          className="button"
          data-kind="danger"
          disabled={busy || !(dirty || view.hasDraft)}
          onClick={() => {
            setConfirming('discard');
          }}
        >
          Butta via le modifiche
        </button>
        <button
          type="button"
          className="button"
          disabled={busy}
          onClick={() => {
            setConfirming('reset');
          }}
        >
          Riparti dai valori del programma
        </button>
      </div>

      {confirming === undefined ? null : (
        <Notice tone="info">
          {CONFIRMATIONS[confirming]}{' '}
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              run(confirming === 'discard' ? discardDraft : resetDraftToProgramValues);
            }}
          >
            Sì
          </button>{' '}
          <button
            type="button"
            className="button"
            onClick={() => {
              setConfirming(undefined);
            }}
          >
            No
          </button>
        </Notice>
      )}

      {publishing ? (
        <Panel title="Pubblica la bozza">
          <label htmlFor="publish-note">Cosa hai cambiato?</label>
          <input
            id="publish-note"
            type="text"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
            }}
          />
          <div className="actions">
            <button
              type="button"
              className="button"
              data-kind="primary"
              disabled={busy || note.trim() === ''}
              onClick={publish}
            >
              Pubblica adesso
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                setPublishing(false);
              }}
            >
              Annulla
            </button>
          </div>
        </Panel>
      ) : null}

      {outcome === undefined ? null : outcome.release === undefined ? (
        <>
          <Notice tone="error">
            Non ho pubblicato niente: c’è qualcosa da correggere. Resta attiva la configurazione di
            prima.
          </Notice>
          <IssueList issues={outcome.issues.filter((issue) => issue.severity === 'error')} />
        </>
      ) : (
        <Notice tone="info">Pubblicata. Ha effetto da subito.</Notice>
      )}
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}

      {SECTIONS.map((section) => (
        <SectionPanel
          key={section.id}
          section={section}
          config={config}
          onConfig={setConfig}
          issues={view.issues}
          {...(section.id === 'connections'
            ? {
                renderExtra: (item: { value: unknown }) => (
                  <KeyStatus connection={item.value} secrets={secrets} onChanged={onSecrets} />
                ),
              }
            : {})}
        />
      ))}
    </>
  );
}
