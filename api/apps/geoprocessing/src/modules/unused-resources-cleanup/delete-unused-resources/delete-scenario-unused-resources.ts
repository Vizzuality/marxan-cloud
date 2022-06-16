import { DeleteUnsusedReosurces } from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteScenarioUnsusedReosurces
  implements DeleteUnsusedReosurces<{}> {
  async removeUnusedResources(scenarioId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
