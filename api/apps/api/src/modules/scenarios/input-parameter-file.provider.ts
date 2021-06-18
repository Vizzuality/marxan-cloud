import { Inject, Injectable } from '@nestjs/common';
import { omit, pick } from 'lodash';
import { isDefined } from '@marxan/utils';
import { ScenariosCrudService } from './scenarios-crud.service';

export const ioSettingsToken = Symbol('Marxan IO settings token');

export interface IoSettings {
  INPUTDIR: string;
  PUNAME: string;
  SPECNAME: string;
  PUVSPRNAME: string;
  BOUNDNAME: string;
  OUTPUTDIR: string;
}

class InputParameterFile {
  private ioSettingsKeys: (keyof IoSettings)[] = [
    'INPUTDIR',
    'PUNAME',
    'SPECNAME',
    'PUVSPRNAME',
    'BOUNDNAME',
    'OUTPUTDIR',
  ];
  private forbiddenKeys = ['BLM', 'NUMREPS', ...this.ioSettingsKeys];

  constructor(
    private readonly ioSettings: IoSettings,
    private readonly boundaryLengthModifier?: number,
    private readonly numberOfRuns?: number,
    private readonly marxanInputParameterFile?: Record<string, string | number>,
  ) {}

  toString(): string {
    let builder = '';
    builder = this.addBlm(builder);
    builder = this.addNumreps(builder);
    builder = this.addInputParametersFile(builder);
    builder = this.addIoSettings(builder);
    return builder;
  }

  private addIoSettings(builder: string) {
    builder += Object.entries(pick(this.ioSettings, this.ioSettingsKeys))
      .map((entry) => entry.join(' '))
      .join('\n');
    return builder;
  }

  private addInputParametersFile(builder: string) {
    if (isDefined(this.marxanInputParameterFile)) {
      builder += Object.entries(
        omit(this.marxanInputParameterFile, this.forbiddenKeys),
      )
        .map((entry) => entry.join(' '))
        .join('\n');
      builder += '\n';
    }
    return builder;
  }

  private addNumreps(builder: string) {
    if (isDefined(this.numberOfRuns)) {
      builder += `NUMREPS ${this.numberOfRuns}\n`;
    }
    return builder;
  }

  private addBlm(builder: string) {
    if (isDefined(this.boundaryLengthModifier)) {
      builder += `BLM ${this.boundaryLengthModifier}\n`;
    }
    return builder;
  }
}

@Injectable()
export class InputParameterFileProvider {
  constructor(
    private readonly scenariosService: ScenariosCrudService,
    @Inject(ioSettingsToken)
    private readonly ioSettings: IoSettings,
  ) {}

  async getInputParameterFile(scenarioId: string): Promise<string> {
    const scenario = await this.scenariosService.getById(scenarioId);
    const inputParameterFile = new InputParameterFile(
      this.ioSettings,
      scenario.boundaryLengthModifier,
      scenario.numberOfRuns,
      scenario.metadata?.marxanInputParameterFile,
    );
    return inputParameterFile.toString();
  }
}
