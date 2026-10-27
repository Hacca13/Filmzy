import type { ConfigChange } from '@filmzy/contracts';

import { describeChange } from './changes';

/** «Cosa cambia»: le differenze fra due configurazioni, una per riga. */
export function ChangeList({
  changes,
  empty,
}: {
  changes: readonly ConfigChange[];
  empty: string;
}) {
  if (changes.length === 0) return <p className="hint">{empty}</p>;

  return (
    <ul className="issues">
      {changes.map((change) => (
        <li key={`${change.section}:${change.key}`}>{describeChange(change)}</li>
      ))}
    </ul>
  );
}
