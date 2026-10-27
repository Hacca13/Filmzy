import type { SpendOverview } from '@filmzy/contracts';
import { Controller, Get, Inject, Module } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SPEND_LEDGER } from '../troupe/tokens.js';
import type { SpendLedger } from './spend-ledger.js';

/** `GET /spend` (T3.1): quanto speso nel mese per fornitore, con i limiti. Nessuna logica: la sa il registro. */
@Controller('spend')
class SpendController {
  constructor(@Inject(SPEND_LEDGER) private readonly ledger: SpendLedger) {}

  @Get()
  async overview(): Promise<SpendOverview> {
    const overview = await this.ledger.overview();
    if (overview === undefined) throw domainError(404, 'not_found');
    return overview;
  }
}

@Module({ controllers: [SpendController] })
export class SpendModule {}
