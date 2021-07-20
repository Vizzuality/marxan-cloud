import { API_EVENT_KINDS } from '@marxan/api-events';

export class ScenarioRunProgressV1Alpha1 {
  kind!: API_EVENT_KINDS.scenario__run__progress__v1__alpha1;
  fractionalProgress!: number;
}
