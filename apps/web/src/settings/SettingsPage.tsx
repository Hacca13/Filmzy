import type { ReactNode } from 'react';

import { AdvancedPage } from './advanced/AdvancedPage';
import { GenerationPage } from './GenerationPage';
import { UpdatesPage } from './UpdatesPage';

interface Section {
  id: string;
  label: string;
  page: () => ReactNode;
}

/** Le voci del menu che esistono già; le altre del design arrivano con i loro task (T2.4–T2.7). */
const SECTIONS: Section[] = [
  { id: 'generazione', label: 'Generazione', page: () => <GenerationPage /> },
  { id: 'aggiornamenti', label: 'Aggiornamenti', page: () => <UpdatesPage /> },
  { id: 'avanzate', label: 'Avanzate', page: () => <AdvancedPage /> },
];

const SECTION_PREFIX = '/impostazioni/';

export function SettingsPage({ path }: { path: string }) {
  const requested = path.startsWith(SECTION_PREFIX) ? path.slice(SECTION_PREFIX.length) : undefined;
  const current = SECTIONS.find((section) => section.id === requested) ?? SECTIONS[0];

  return (
    <div className="settings">
      <header className="settings-header">
        <h1>Impostazioni</h1>
        <a href="#/">← Indietro</a>
      </header>
      <div className="settings-body">
        <nav className="settings-menu" aria-label="Impostazioni">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${SECTION_PREFIX}${section.id}`}
              aria-current={section.id === current?.id ? 'page' : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <main className="settings-content">{current?.page()}</main>
      </div>
    </div>
  );
}
