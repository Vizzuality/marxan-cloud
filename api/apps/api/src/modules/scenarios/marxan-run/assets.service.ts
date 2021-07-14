import { Assets } from '@marxan/scenario-run-queue';
import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IoSettings, ioSettingsToken } from './io-settings';

export const apiUrlToken = Symbol('api url token');
export const apiUrlProvider: FactoryProvider<string> = {
  provide: apiUrlToken,
  useFactory: () => AppConfig.get<string>('api.url'),
};

@Injectable()
export class AssetsService {
  constructor(
    @Inject(ioSettingsToken)
    private readonly settings: IoSettings,
    @Inject(apiUrlToken)
    private readonly apiUrlToken: string,
  ) {}

  async forScenario(id: string): Promise<Assets> {
    return [
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/input.dat`,
        relativeDestination: 'input.dat',
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/pu.dat`,
        relativeDestination: `${this.settings.INPUTDIR}/${this.settings.PUNAME}`,
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/bound.dat`,
        relativeDestination: `${this.settings.INPUTDIR}/${this.settings.BOUNDNAME}`,
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/spec.dat`,
        relativeDestination: `${this.settings.INPUTDIR}/${this.settings.SPECNAME}`,
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/puvspr.dat`,
        relativeDestination: `${this.settings.INPUTDIR}/${this.settings.PUVSPRNAME}`,
      },
    ];
  }
}
