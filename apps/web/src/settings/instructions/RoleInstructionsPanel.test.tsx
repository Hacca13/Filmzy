import type { InstructionVersionInfo, RoleInstructions } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MODERATOR_WARNING } from './model';
import { RoleInstructionsPanel } from './RoleInstructionsPanel';

function version(
  number: number,
  extra: Partial<InstructionVersionInfo> = {},
): InstructionVersionInfo {
  return {
    version: number,
    origin: 'bundled',
    label: `Versione ${String(number)}`,
    description: '',
    changelog: [],
    variables: [],
    variants: [],
    ...extra,
  };
}

function render(role: RoleInstructions): string {
  return renderToStaticMarkup(
    <RoleInstructionsPanel role={role} onRole={() => undefined} onSaved={() => undefined} />,
  );
}

const screenwriter: RoleInstructions = {
  roleId: 'screenwriter',
  instructionsId: 'screenwriter',
  label: 'Sceneggiatore',
  recommended: 2,
  inUse: 1,
  chosen: 'screenwriter@1',
  availableVariables: ['idea'],
  versions: [
    version(1),
    version(2, {
      changelog: ['Passaggi più naturali tra le scene'],
      variants: ['seedance'],
    }),
  ],
};

describe('RoleInstructionsPanel', () => {
  it('chi è rimasto sulla vecchia vede la nuova con i suoi cambiamenti, e può provarla', () => {
    const html = render(screenwriter);

    expect(html).toContain('C’è una versione più nuova: Versione 2.');
    expect(html).toContain('Passaggi più naturali tra le scene');
    expect(html).toContain('Provala');
    expect(html).toContain('Resta con la vecchia');
  });

  it('mostra ogni versione col suo stato', () => {
    const html = render(screenwriter);

    expect(html).toContain('Versione 1');
    expect(html).toContain('In uso');
    expect(html).toContain('Consigliata');
    expect(html).toContain('Varianti per: seedance');
  });

  it('la versione in uso non ha «Usa questa», le altre sì', () => {
    const html = render(screenwriter);

    expect(html.match(/Usa questa/g)).toHaveLength(1);
  });

  it("«Torna ai valori predefiniti» c'è solo se l'utente ha scelto", () => {
    expect(render(screenwriter)).toContain('Torna ai valori predefiniti');
    expect(render({ ...screenwriter, chosen: undefined, inUse: 2 })).not.toContain(
      'Torna ai valori predefiniti',
    );
  });

  it('chi usa già la consigliata non vede nessun avviso di versione nuova', () => {
    const html = render({ ...screenwriter, chosen: undefined, inUse: 2 });

    expect(html).not.toContain('versione più nuova');
  });

  it('con un testo suo per il moderatore ricorda la responsabilità', () => {
    const moderator: RoleInstructions = {
      ...screenwriter,
      roleId: 'moderator',
      label: 'Moderatore',
      recommended: 1,
      inUse: 101,
      chosen: 'moderator@101',
      versions: [version(1), version(101, { origin: 'user', label: 'Le mie istruzioni 1' })],
    };

    expect(render(moderator)).toContain(MODERATOR_WARNING);
    expect(render({ ...moderator, inUse: 1, chosen: undefined })).not.toContain(MODERATOR_WARNING);
  });
});
