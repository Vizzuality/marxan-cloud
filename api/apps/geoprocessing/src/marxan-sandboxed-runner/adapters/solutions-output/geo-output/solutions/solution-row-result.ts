import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output/output-scenarios-pu-data.geo.entity';

export type SolutionRowResult = Pick<
  OutputScenariosPuDataGeoEntity,
  'runId' | 'value' | 'scenarioPuId'
>;
