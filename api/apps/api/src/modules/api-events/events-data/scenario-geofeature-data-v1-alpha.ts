import { API_EVENT_KINDS } from '@marxan/api-events';
import { ValuesType } from 'utility-types';

export type ScenarioGeofeatureEvents = Pick<
  typeof API_EVENT_KINDS,
  Extract<
    keyof typeof API_EVENT_KINDS,
    `scenario__geofeature${`Copy` | `Split` | `Stratification`}${string}`
  >
>;

export class ScenarioGeofeatureDataV1Alpha {
  kind!: ValuesType<ScenarioGeofeatureEvents>;
  featureId!: string;
}
