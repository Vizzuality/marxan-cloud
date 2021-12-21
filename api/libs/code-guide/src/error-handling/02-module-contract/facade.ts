import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';
import { LegacyService, MagicActionErrors } from './legacy-service';
import { ThirdPartyService, ThirdPartyErrors } from './third-party-service';

export type ComposedActionError = MagicActionErrors | ThirdPartyErrors;
export type OperationSubmitted = true;

@Injectable()
export class Facade {
  constructor(
    private readonly legacyService: LegacyService,
    private readonly thirdParty: ThirdPartyService,
  ) {}

  async doComposedAction(): Promise<
    Either<ComposedActionError, OperationSubmitted>
  > {
    const data = await this.thirdParty.get();
    if (data) {
      throw new Error(`data not available`);
    }

    await this.legacyService.doSomething();

    return right(true);
  }
}
