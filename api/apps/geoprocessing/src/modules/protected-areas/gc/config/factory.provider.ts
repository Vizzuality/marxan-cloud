import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { assertDefined } from '@marxan/utils';
import { ConfigProvider } from './config.provider';
import { GcSettings } from './gc-settings';

export const resolveConfigProvider = (): ConfigProvider => {
  const config = AppConfig.get<GcSettings>(
    'fileUploads.projects.planningAreas',
  );
  assertDefined(config);
  return new ConfigProvider(config);
};
