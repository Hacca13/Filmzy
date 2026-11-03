import { useCallback, useRef, useState, type ChangeEvent } from 'react';

import { fetchUploads, uploadImage, type UploadTarget } from '../../api/uploads';
import { Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { useAction } from '../../settings/use-action';
import { checkingHint, fileProblem, nameOf, workingText } from './uploads-model';

/** I tipi che il selettore di file propone: gli stessi che il server accetta. */
const ACCEPT = 'image/png,image/jpeg,image/webp';

/**
 * Il pulsante «Carica una foto» (T4.8, D19): l'utente sceglie un file, il server lo controlla e lo
 * salva, poi `onUploaded` fa rileggere a chi lo mostra. Non compare se la funzione è spenta. Dice
 * prima cosa succede alla foto: con il controllo acceso una copia va al servizio che legge le
 * immagini, e solo se va bene resta sul computer. Un file che sicuramente non va (tipo o peso) non
 * parte nemmeno; il resto lo decide il server, e un rifiuto dice perché in parole semplici.
 */
export function UploadControl({
  filmId,
  target,
  send,
  hint,
  label,
  onUploaded,
}: {
  filmId: string;
  /** Dove va la foto (luogo o oggetto, T4.8). Senza, serve `send`. */
  target?: Omit<UploadTarget, 'name'>;
  /** Come si manda il file, per chi non carica luoghi e oggetti (le immagini del moodboard, T4.10): la funzione la decide chi chiama. */
  send?: (file: File, name: string | undefined) => Promise<unknown>;
  /** Una frase in più sotto il pulsante, per ciò che vale solo per questo caricamento. */
  hint?: string;
  label: string;
  /** Dopo un caricamento riuscito: chi mostra le foto le rilegge. */
  onUploaded: () => Promise<void> | void;
}) {
  const load = useCallback((signal: AbortSignal) => fetchUploads(filmId, signal), [filmId]);
  const { state } = useResource(load);
  const input = useRef<HTMLInputElement>(null);
  const action = useAction();
  const [note, setNote] = useState<string>();

  // Finché non si sa se la funzione c'è, o se è spenta, non si offre niente.
  if (state.status !== 'ready' || (send === undefined && !state.data.enabled)) return null;
  const { checking } = state.data;

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Si svuota il selettore: scegliere di nuovo lo stesso file deve far ripartire il caricamento.
    event.target.value = '';
    if (file === undefined) return;

    const problem = fileProblem(file);
    setNote(problem);
    if (problem !== undefined) return;

    const name = nameOf(file.name);
    action.run(async () => {
      if (send !== undefined) await send(file, name);
      else if (target !== undefined) {
        await uploadImage(filmId, { ...target, ...(name === undefined ? {} : { name }) }, file);
      }
      await onUploaded();
    });
  };

  return (
    <div className="upload-control">
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={pick} />
      <button
        type="button"
        className="button"
        disabled={action.busy}
        onClick={() => {
          input.current?.click();
        }}
      >
        {action.busy ? workingText(checking) : label}
      </button>
      <p className="hint">{checkingHint(checking)}</p>
      {hint === undefined ? null : <p className="hint">{hint}</p>}
      {note === undefined ? null : <Notice tone="error">{note}</Notice>}
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </div>
  );
}
