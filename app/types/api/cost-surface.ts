import { Scenario } from './scenario';

export interface CostSurface {
  id: string;
  name: string;
  isDefault: boolean;
  min: number;
  max: number;
  scenarioUsageCount: number;
  scenarios?: (Pick<Scenario, 'id' | 'name'> & { type: 'scenarios' })[];
}
