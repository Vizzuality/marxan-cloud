import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { ScenariosCrudService } from './scenarios-crud.service';

class InputParameterFile {
  constructor(
    private readonly boundaryLengthModifier?: number,
    private readonly numberOfRuns?: number,
    private readonly marxanInputParameterFile?: Record<string, string | number>,
  ) {}

  toString(): string {
    let builder = '';
    if (isDefined(this.boundaryLengthModifier)) {
      builder += `BLM ${this.boundaryLengthModifier}\n`;
    }
    if (isDefined(this.numberOfRuns)) {
      builder += `NUMREPS ${this.numberOfRuns}\n`;
    }
    if (isDefined(this.marxanInputParameterFile)) {
      builder += Object.entries(this.marxanInputParameterFile)
        .map((entry) => entry.join(' '))
        .filter(([key]) => key !== 'BLM' && key !== 'NUMREPS')
        .join('\n');
    }
    return builder;
  }
}

@Injectable()
export class InputParameterFileProvider {
  constructor(private readonly scenariosService: ScenariosCrudService) {}

  async getInputParameterFile(scenarioId: string): Promise<string> {
    const scenario = await this.scenariosService.getById(scenarioId);
    const inputParameterFile = new InputParameterFile(
      scenario.boundaryLengthModifier,
      scenario.numberOfRuns,
      scenario.metadata?.marxanInputParameterFile,
    );
    return inputParameterFile.toString();
  }
}
