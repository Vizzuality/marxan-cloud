import { Injectable } from '@nestjs/common';
import { InputFiles } from '../../ports/input-files';

@Injectable()
export class DeriveScenarioFacade implements InputFiles {
  async include(scenarioId: string, directory: string): Promise<void> {
    // get all scenario data from db
    // and transform them into files required by marxan
    return;
  }
}
