import type { Screenplay, ScreenplayVersionSummary } from '@filmzy/contracts';

import { SceneList } from './SceneList';
import { totalDuration, versionLabel, versionNote } from './model';

/** La bozza come si legge: titolo, trama in una riga, scene riassunte, personaggi e luoghi proposti. */
export function ScreenplayView({ screenplay }: { screenplay: Screenplay }) {
  return (
    <article className="screenplay">
      <h3>{screenplay.title}</h3>
      <p>{screenplay.logline}</p>
      <p className="hint">
        {screenplay.scenes.length} scene · circa {totalDuration(screenplay)}
      </p>
      <SceneList scenes={screenplay.scenes} people={screenplay.characters} />
      {screenplay.characters.length === 0 ? null : (
        <section>
          <h4>Personaggi proposti</h4>
          <ul className="proposals">
            {screenplay.characters.map((character) => (
              <li key={character.id}>
                <strong>{character.name}</strong> <span className="hint">{character.role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {screenplay.locations.length === 0 ? null : (
        <section>
          <h4>Luoghi proposti</h4>
          <ul className="proposals">
            {screenplay.locations.map((location) => (
              <li key={location.id}>
                <strong>{location.name}</strong>{' '}
                <span className="hint">{location.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

interface PickerProps {
  versions: readonly ScreenplayVersionSummary[];
  /** La versione che si sta leggendo. */
  selectedId: string;
  onSelect: (versionId: string) => void;
  /** Cosa dire di ogni versione; di solito com'è nata una bozza. */
  noteOf?: (version: ScreenplayVersionSummary) => string;
  label?: string;
}

/** Le versioni, dalla più recente: ognuna si rilegge com'era. */
export function VersionPicker({
  versions,
  selectedId,
  onSelect,
  noteOf = versionNote,
  label = 'Versioni della storia',
}: PickerProps) {
  if (versions.length < 2) return null;
  return (
    <nav className="versions" aria-label={label}>
      {versions.map((version, index) => (
        <button
          key={version.id}
          type="button"
          className="version"
          data-selected={version.id === selectedId}
          aria-current={version.id === selectedId}
          onClick={() => {
            onSelect(version.id);
          }}
        >
          <strong>{versionLabel(version, index === 0)}</strong>
          <span className="hint">{noteOf(version)}</span>
        </button>
      ))}
    </nav>
  );
}
