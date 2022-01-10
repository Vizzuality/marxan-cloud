import { Injectable } from '@nestjs/common';
import { LegacyService } from './legacy-service';
import { ThirdPartyService } from './third-party-service';

@Injectable()
export class Facade {
  constructor(
    private readonly legacyService: LegacyService,
    private readonly thirdParty: ThirdPartyService,
  ) {}

  async doComposedAction() {
    const data = await this.thirdParty.get();
    if (data) {
      throw new Error(`data not available`);
    }

    await this.legacyService.doSomething();

    return true;
  }
}
