import { Liquid } from 'liquidjs';

/**
 * Il rendering delle istruzioni (architettura §4.4): template LiquidJS in **modalità rigorosa**,
 * così una variabile che non esiste è un errore e non un prompt con un buco. Le variabili sono i
 * campi dell'input del ruolo, e quelle facoltative arrivano sempre, a `null`.
 */
const engine = new Liquid({ strictVariables: true, strictFilters: true });

export class InstructionRenderError extends Error {
  constructor(
    readonly section: string,
    readonly reason: string,
  ) {
    super(`la sezione "## ${section}" non si rende: ${reason}`);
    this.name = 'InstructionRenderError';
  }
}

/** Rende una sezione sola. Lancia `InstructionRenderError` se il template chiede l'impossibile. */
export async function renderSection(
  section: string,
  template: string,
  input: unknown,
): Promise<string> {
  try {
    // LiquidJS non tipizza il risultato: è testo, e lo trattiamo come tale.
    const text: unknown = await engine.parseAndRender(template, input as Record<string, unknown>);
    return String(text).trim();
  } catch (error) {
    throw new InstructionRenderError(
      section,
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Rende tutte le sezioni di un'istruzione con lo stesso input. */
export async function renderSections(
  sections: Record<string, string>,
  input: unknown,
): Promise<Record<string, string>> {
  const rendered: Record<string, string> = {};
  for (const [name, template] of Object.entries(sections)) {
    rendered[name] = await renderSection(name, template, input);
  }
  return rendered;
}
