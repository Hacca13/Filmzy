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

export function Notice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <p className="notice" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
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
