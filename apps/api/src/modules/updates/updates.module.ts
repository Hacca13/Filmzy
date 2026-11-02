import type { UpdateCheckResult } from '@filmzy/contracts';
import { Controller, HttpCode, Inject, Module, Post, type DynamicModule } from '@nestjs/common';

/**
 * Chi controlla se c'è una versione nuova (D44). Il controllo vero lo fa l'app installata
 * (electron-updater, T6.4): qui c'è l'interfaccia, così il contratto con l'interfaccia web non
 * cambia quando arriva.
 */
export interface UpdateChecker {
  check: () => Promise<UpdateCheckResult>;
}

export const UPDATE_CHECKER = Symbol('UPDATE_CHECKER');

/** Fuori dall'app installata non c'è niente da controllare: lo dice, non finge. */
export const unavailableUpdateChecker: UpdateChecker = {
  check: () => Promise.resolve({ status: 'unavailable' }),
};

@Controller('updates')
class UpdatesController {
  constructor(@Inject(UPDATE_CHECKER) private readonly checker: UpdateChecker) {}

  @Post('check')
  @HttpCode(200)
  check(): Promise<UpdateCheckResult> {
    return this.checker.check();
  }
}

@Module({})
export class UpdatesModule {
  static forRoot(options: { checker?: UpdateChecker } = {}): DynamicModule {
    return {
      module: UpdatesModule,
      controllers: [UpdatesController],
      providers: [
        { provide: UPDATE_CHECKER, useValue: options.checker ?? unavailableUpdateChecker },
      ],
    };
  }
}
