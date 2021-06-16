import { Injectable } from '@nestjs/common';
import { SolutionsRepository } from '../../ports/solutions-repository';

@Injectable()
export class SolutionsOutputFacade implements SolutionsRepository {
  /**
   * load entities
   * file streamers
   * ...
   */
  constructor() {
    //
  }

  async saveFrom(_rootDirectory: string, _scenarioId: string): Promise<void> {
    return;
  }
}
