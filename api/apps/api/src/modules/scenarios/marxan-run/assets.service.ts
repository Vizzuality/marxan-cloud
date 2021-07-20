import { Assets } from '@marxan/scenario-run-queue';
import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { InputFilesService } from '@marxan-api/modules/scenarios/input-files';

export const apiUrlToken = Symbol('api url token');
export const apiUrlProvider: FactoryProvider<string> = {
  provide: apiUrlToken,
  useFactory: () => AppConfig.get<string>('api.url'),
};

@Injectable()
export class AssetsService {
  constructor(
    @Inject(apiUrlToken)
    private readonly apiUrlToken: string,
    private readonly inputFiles: InputFilesService,
  ) {}

  async forScenario(id: string, blm?: number): Promise<Assets> {
    const settings = await this.inputFiles.getSettings();
    return [
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/input.dat`,
        relativeDestination: 'input.dat',
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/pu.dat`,
        relativeDestination: `${settings.INPUTDIR}/${settings.PUNAME}`,
      },
      ...(blm !== 0
        ? [
            {
              url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/bound.dat`,
              relativeDestination: `${settings.INPUTDIR}/${settings.BOUNDNAME}`,
            },
          ]
        : []),
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/spec.dat`,
        relativeDestination: `${settings.INPUTDIR}/${settings.SPECNAME}`,
      },
      {
        url: `${this.apiUrlToken}/api/v1/marxan-run/scenarios/${id}/marxan/dat/puvspr.dat`,
        relativeDestination: `${settings.INPUTDIR}/${settings.PUVSPRNAME}`,
      },
    ];
  }
}
