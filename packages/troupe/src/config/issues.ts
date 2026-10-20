/**
 * Un problema trovato nella configurazione (architettura §4.6). Un `error` impedisce la
 * pubblicazione, un `warning` no: nei file di seme, per esempio, un prezzo mancante o un id da
 * verificare sono avvisi.
 *
 * Il messaggio è in italiano e **nomina ruolo e campo**, perché è ciò che serve a capire dove
 * guardare; i campi accanto servono all'interfaccia delle impostazioni avanzate per raggruppare.
 */
export interface ConfigIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  section?: 'connections' | 'models' | 'roles' | 'features' | 'presets' | 'instructions' | 'bench';
  key?: string;
  role?: string;
  modelId?: string;
  connectionId?: string;
  field?: string;
}

export function hasErrors(issues: readonly ConfigIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
