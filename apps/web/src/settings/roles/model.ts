import type { DomainErrorCode, RoleState } from '@filmzy/contracts';

/** Le parole di «Chi fa cosa», fuori dai componenti così si provano a parte. */

const PROBLEM_TEXT: Partial<Record<DomainErrorCode, string>> = {
  role_disabled: 'Spento',
  no_eligible_model: 'Nessun servizio adatto: attivane uno in Connessioni',
  config_invalid: 'Non è configurato',
};

/** Cosa dire di un ruolo che non ha un servizio che lavori. */
export function problemText(role: RoleState): string | undefined {
  if (role.problem === undefined) return undefined;
  return PROBLEM_TEXT[role.problem] ?? 'Non si può usare adesso';
}

/** La riga che riassume un ruolo: «Sceneggiatore · Anthropic · Claude Sonnet · Versione 2». */
export function roleSummary(role: RoleState): string {
  const who =
    role.inUse === undefined
      ? (problemText(role) ?? 'Nessun servizio')
      : `${role.inUse.connectionLabel} · ${role.inUse.modelLabel}`;
  return [role.label, who, role.instructions?.label]
    .filter((part) => part !== undefined)
    .join(' · ');
}

/** Il valore del campo della select: vuoto vuol dire «come da programma». */
export const AS_DEFAULT = '';

export function selectedService(role: RoleState): string {
  return role.chosenModelId ?? AS_DEFAULT;
}

/** Un numero per il campo della creatività: virgola decimale, come si legge in italiano. */
export function temperatureToField(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',');
}

/**
 * La creatività scritta a mano, dentro i limiti del servizio. Vuoto è `null` (torna al valore del
 * programma); fuori dai limiti o non un numero è `undefined`, e il pulsante resta spento.
 */
export function parseTemperature(
  text: string,
  limits: { min?: number | undefined; max?: number | undefined },
): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value)) return undefined;
  if (limits.min !== undefined && value < limits.min) return undefined;
  if (limits.max !== undefined && value > limits.max) return undefined;
  return value;
}
