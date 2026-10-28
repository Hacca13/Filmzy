import type { Location, Locations, ScreenplayLocationProposal } from '@filmzy/contracts';
import { useCallback } from 'react';

import { addLocation, fetchLocations, removeLocation } from '../../api/locations';
import { Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useAction } from '../../settings/use-action';
import { LocationImagesSection } from './LocationImagesSection';

/**
 * «I luoghi» (T3.7, D18): lo sceneggiatore li propone nella bozza, l'utente li aggiunge al film, e
 * per ognuno si fanno le immagini del set e se ne sceglie una come riferimento.
 */
export function LocationsPanel({ filmId }: { filmId: string }) {
  const load = useCallback((signal: AbortSignal) => fetchLocations(filmId, signal), [filmId]);
  const locations = useResource(load);

  if (locations.state.status === 'error') {
    return <Notice tone="error">{describeError(locations.state.error)}</Notice>;
  }
  if (locations.state.status === 'loading') return <p className="hint">Un attimo…</p>;

  return <LocationsView filmId={filmId} data={locations.state.data} reload={locations.reload} />;
}

interface ViewProps {
  filmId: string;
  data: Locations;
  reload: () => void;
}

function LocationsView({ filmId, data, reload }: ViewProps) {
  const action = useAction();

  return (
    <section className="panel cast">
      <h2>I luoghi</h2>
      <p className="hint">
        Dove si svolge la storia. Aggiungi i luoghi che la bozza propone, poi crea le immagini del
        set e scegline una per ognuno.
      </p>

      {data.locations.length === 0 ? null : (
        <ul className="characters">
          {data.locations.map((location) => (
            <LocationCard
              key={location.id}
              filmId={filmId}
              location={location}
              busy={action.busy}
              onRemove={() => {
                action.run(async () => {
                  await removeLocation(filmId, location.id);
                  reload();
                });
              }}
            />
          ))}
        </ul>
      )}

      {data.proposals.length === 0 ? (
        data.locations.length === 0 ? (
          <p className="hint">
            La bozza non propone ancora nessun luogo: scrivila prima nella sezione «La storia».
          </p>
        ) : null
      ) : (
        <>
          <h3>Proposti dalla bozza</h3>
          <ul className="characters">
            {data.proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                busy={action.busy}
                onAdd={() => {
                  action.run(async () => {
                    await addLocation(filmId, proposal.id);
                    reload();
                  });
                }}
              />
            ))}
          </ul>
        </>
      )}

      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </section>
  );
}

/** Un luogo proposto dalla bozza, ancora da aggiungere. */
export function ProposalCard({
  proposal,
  busy,
  onAdd,
}: {
  proposal: ScreenplayLocationProposal;
  busy: boolean;
  onAdd: () => void;
}) {
  return (
    <li className="character-card" data-kind="suggestion">
      <h4>{proposal.name}</h4>
      <p>{proposal.description}</p>
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy}
          onClick={onAdd}
        >
          Aggiungi
        </button>
      </div>
    </li>
  );
}

/** Un luogo del film, con le sue immagini del set. */
export function LocationCard({
  filmId,
  location,
  busy,
  onRemove,
}: {
  filmId: string;
  location: Location;
  busy: boolean;
  onRemove: () => void;
}) {
  return (
    <li className="character-card">
      <h4>{location.name}</h4>
      <p>{location.description}</p>
      <LocationImagesSection filmId={filmId} locationId={location.id} />
      <div className="actions">
        <button type="button" className="button" disabled={busy} onClick={onRemove}>
          Togli dal film
        </button>
      </div>
    </li>
  );
}
