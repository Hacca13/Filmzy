import type { ConfigIssue } from '@filmzy/contracts';
import type { ReactNode } from 'react';

/** I pezzi di interfaccia che tornano in tutte le impostazioni: pannello, interruttore, avviso. */

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Spiegazione sotto il nome, in parole semplici. */
  hint?: string;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, hint, disabled = false }: ToggleProps) {
  return (
    <div className="toggle-row">
      <div>
        <p className="toggle-label">{label}</p>
        {hint === undefined ? null : <p className="hint">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="toggle"
        disabled={disabled}
        onClick={() => {
          onChange(!checked);
        }}
      >
        {checked ? 'Acceso' : 'Spento'}
      </button>
    </div>
  );
}

/** Le icone dei chip (come nel disegno): un segno semplice per ogni tono, senza testo alternativo perché il chip ha già le sue parole. */
const ICONS: Record<ChipTone, ReactNode> = {
  confirmed: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  warning: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
};

export type ChipTone = 'confirmed' | 'warning' | 'info' | 'error';

/** L'icona di un tono, per i chip e per i riquadri (errore su un'immagine che non c'è). */
export function ToneIcon({ tone, size = 16 }: { tone: ChipTone; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[tone]}
    </svg>
  );
}

/** Un'etichetta di stato (confermato, da controllare, informazione, errore): sempre con parole, mai solo colore. */
export function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return (
    <span className="chip" data-tone={tone}>
      <ToneIcon tone={tone} />
      {children}
    </span>
  );
}

/**
 * Un avviso. Con `title` diventa un riquadro con il suo chip in cima (come nel disegno: «Informazione»,
 * «Non compatibile», «Prima di continuare»); senza resta la riga semplice di prima.
 */
export function Notice({
  tone,
  title,
  children,
}: {
  tone: 'error' | 'info';
  title?: string;
  children: ReactNode;
}) {
  const role = tone === 'error' ? 'alert' : 'status';
  if (title === undefined) {
    return (
      <p className="notice" data-tone={tone} role={role}>
        {children}
      </p>
    );
  }
  return (
    <div className="notice boxed" data-tone={tone} role={role}>
      <Chip tone={tone}>{title}</Chip>
      <div className="notice-body">{children}</div>
    </div>
  );
}

/** I problemi del validatore, uno per riga, col loro peso (da correggere o solo da sapere). */
export function IssueList({ issues }: { issues: readonly ConfigIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="issues">
      {issues.map((issue) => (
        <li
          key={`${issue.code}:${issue.key ?? ''}:${issue.message}`}
          data-severity={issue.severity}
        >
          {issue.severity === 'error' ? 'Da correggere: ' : 'Attenzione: '}
          {issue.message}
        </li>
      ))}
    </ul>
  );
}
