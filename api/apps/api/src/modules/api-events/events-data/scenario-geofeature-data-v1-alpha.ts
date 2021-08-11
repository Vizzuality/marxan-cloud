import { ScenarioGeofeatureEvents } from '@marxan/api-events';
import { ValuesType } from 'utility-types';

export class ScenarioGeofeatureDataV1Alpha {
  kind!: ValuesType<ScenarioGeofeatureEvents>;
  featureId!: string;
}
