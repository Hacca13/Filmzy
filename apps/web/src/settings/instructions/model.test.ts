import type { InstructionVersionInfo, RoleInstructions } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  badgesOf,
  needsModeratorWarning,
  newerVersionNotice,
  sectionTitle,
  templateFileName,
  withRole,
} from './model';

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

function role(extra: Partial<RoleInstructions> = {}): RoleInstructions {
  return {
    roleId: 'screenwriter',
    instructionsId: 'screenwriter',
    label: 'Sceneggiatore',
    recommended: 2,
    inUse: 2,
    availableVariables: ['idea'],
    versions: [version(1), version(2, { changelog: ['Finali meno prevedibili'] })],
    ...extra,
  };
}

describe('newerVersionNotice', () => {
  it('chi è rimasto sulla vecchia vede la nuova, con i suoi cambiamenti', () => {
    const notice = newerVersionNotice(role({ inUse: 1, chosen: 'screenwriter@1' }));

    expect(notice?.version).toBe(2);
    expect(notice?.changelog).toEqual(['Finali meno prevedibili']);
  });

  it('chi usa già la consigliata, o una più nuova, non vede niente', () => {
    expect(newerVersionNotice(role())).toBeUndefined();
    expect(newerVersionNotice(role({ inUse: 101 }))).toBeUndefined();
  });
});

describe('badgesOf', () => {
  it('dice in uso, consigliata e tua', () => {
    const mine = version(101, { origin: 'user' });
    const r = role({ inUse: 101, versions: [version(1), version(2), mine] });

    expect(badgesOf(r, mine).map((badge) => badge.text)).toEqual(['In uso', 'Tua']);
    expect(badgesOf(r, version(2)).map((badge) => badge.text)).toEqual(['Consigliata']);
    expect(badgesOf(r, version(1))).toEqual([]);
  });
});

describe('needsModeratorWarning', () => {
  const moderator = (extra: Partial<RoleInstructions> = {}) =>
    role({
      roleId: 'moderator',
      versions: [version(1), version(101, { origin: 'user' })],
      ...extra,
    });

  it("si mostra mentre si scrive, o quando gira un testo dell'utente", () => {
    expect(needsModeratorWarning(moderator({ inUse: 1, recommended: 1 }), false)).toBe(false);
    expect(needsModeratorWarning(moderator({ inUse: 1, recommended: 1 }), true)).toBe(true);
    expect(needsModeratorWarning(moderator({ inUse: 101 }), false)).toBe(true);
  });

  it('per gli altri ruoli non si mostra mai', () => {
    expect(needsModeratorWarning(role(), true)).toBe(false);
  });
});

describe('sectionTitle', () => {
  it('traduce i nomi tecnici e lascia stare gli altri', () => {
    expect(sectionTitle('system')).toBe('Istruzioni di base');
    expect(sectionTitle('altro')).toBe('altro');
  });
});

describe('templateFileName', () => {
  it('ha solo caratteri sicuri', () => {
    expect(templateFileName('screenwriter')).toBe('modello-screenwriter.md');
    expect(templateFileName('../x/y')).toBe('modello-xy.md');
  });
});

describe('withRole', () => {
  it('cambia solo il ruolo dato, nello stesso posto', () => {
    const other = role({ roleId: 'moderator' });
    const next = withRole({ roles: [role(), other] }, role({ inUse: 1 }));

    expect(next.roles.map((entry) => entry.roleId)).toEqual(['screenwriter', 'moderator']);
    expect(next.roles[0]?.inUse).toBe(1);
    expect(next.roles[1]).toBe(other);
  });
});
