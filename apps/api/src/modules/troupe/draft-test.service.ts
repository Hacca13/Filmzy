import {
  ROLE_INPUT_EXAMPLES,
  ROLE_IO,
  type DraftTestEstimate,
  type DraftTestResult,
  type RoleId,
  type TestableRoles,
} from '@filmzy/contracts';
import type { Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { DRAFT_TROUPE } from './tokens.js';
import { TroupeConfigService } from './troupe-config.service.js';

/** Un ruolo di testo: l'unico tipo che `troupe.run` sa eseguire (architettura §4.2). */
type TextRole = Parameters<Troupe['run']>[0];

/**
 * La prova della bozza (T2.5, architettura §4.5 punto 2): un ruolo di testo eseguito sulla bozza
 * con il suo input di esempio fisso (D39), prima di pubblicare. È la stessa troupe di sempre, con
 * la bozza al posto della release: stesse chiavi, stessi scontrini (`purpose: 'draft_test'`).
 *
 * Costa soldi veri con un fornitore vero: per questo la stima è un passo a parte, e la prova parte
 * solo quando l'utente la chiede.
 */
@Injectable()
export class DraftTestService {
  constructor(
    @Inject(DRAFT_TROUPE) private readonly troupe: Troupe,
    private readonly config: TroupeConfigService,
  ) {}

  roles(): TestableRoles {
    const roles = Object.entries(this.config.currentConfig()?.roles ?? {}).flatMap(([id, role]) =>
      role !== undefined && role.enabled !== false && isTextRole(id)
        ? [{ roleId: id, label: role.label }]
        : [],
    );
    return { roles };
  }

  async estimate(roleId: string): Promise<DraftTestEstimate> {
    const { role, example } = this.testable(roleId);
    return { estimate: await this.troupe.estimate(role, example), example };
  }

  async run(roleId: string): Promise<DraftTestResult> {
    const { role, example } = this.testable(roleId);
    const { data, receipt } = await this.troupe.run(role, example, { purpose: 'draft_test' });
    return { example, output: data, receipt };
  }

  /** Il ruolo deve esistere nella configurazione, essere di testo e avere un esempio fisso. */
  private testable(roleId: string): { role: TextRole; example: never } {
    const known = this.roles().roles.some((candidate) => candidate.roleId === roleId);
    if (!known || !isTextRole(roleId)) throw domainError(404, 'not_found');

    // L'esempio è l'input fisso del ruolo: i suoi tipi li controlla `run` con lo schema del ruolo.
    return { role: roleId, example: ROLE_INPUT_EXAMPLES[roleId] as never };
  }
}

function isTextRole(roleId: string): roleId is TextRole {
  return roleId in ROLE_IO && 'output' in ROLE_IO[roleId as RoleId];
}
