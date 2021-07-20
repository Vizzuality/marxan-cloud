import { AppConfig } from '@marxan-api/utils/config.utils';
import { assertDefined } from '@marxan/utils';

export const ioSettingsToken = Symbol('Marxan IO settings token');

export interface IoSettings {
  INPUTDIR: string;
  PUNAME: string;
  SPECNAME: string;
  PUVSPRNAME: string;
  BOUNDNAME: string;
  OUTPUTDIR: string;
}

export const ioSettingsProvider = {
  provide: ioSettingsToken,
  useFactory: () => {
    const config = AppConfig.get<IoSettings>(
      'marxan.inputFiles.inputDat.ioSettings',
    );
    assertDefined(config);
    return config;
  },
};
