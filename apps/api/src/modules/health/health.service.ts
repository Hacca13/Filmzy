import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@filmzy/contracts';

@Injectable()
export class HealthService {
  /** Se questo codice risponde, il server è in piedi. I controlli sui servizi AI arriveranno con la troupe. */
  check(): HealthResponse {
    return { status: 'ok' };
  }
}
