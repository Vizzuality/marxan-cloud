import { Inject, Injectable } from '@nestjs/common';
import { omit, pick } from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { assertDefined, isDefined } from '@marxan/utils';
import { MarxanParametersDefaults } from '@marxan/marxan-input';
import { Scenario } from '../../scenario.api.entity';
import { IoSettings, ioSettingsToken } from './io-settings';

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
    builder = this.addIoSettings(builder);
    builder = this.addInputParametersFile(builder);
    return builder;
  }

  private addIoSettings(builder: string) {
    const ioEntries = Object.entries(pick(this.ioSettings, this.ioSettingsKeys))
      .map((entry) => entry.join(' '))
      .join('\n');
    builder += ioEntries + (ioEntries === '' ? '' : '\n');
    return builder;
  }

  private addInputParametersFile(builder: string) {
    if (isDefined(this.marxanInputParameterFile)) {
      const inputParameterFileEntries = Object.entries(
        omit(this.marxanInputParameterFile, this.forbiddenKeys),
      )
        .map((entry) => entry.join(' '))
        .join('\n');
      builder +=
        inputParameterFileEntries +
        (inputParameterFileEntries === '' ? '' : '\n');
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
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    @Inject(ioSettingsToken)
    private readonly ioSettings: IoSettings,
    private readonly marxanDefaults: MarxanParametersDefaults,
  ) {}

  async getInputParameterFile(scenarioId: string): Promise<string> {
    const scenario = await this.scenarioRepository.findOne(scenarioId, {
      relations: ['project', 'project.organization'],
    });
    assertDefined(scenario);
    const inputParameterFile = new InputParameterFile(
      this.ioSettings,
      scenario.boundaryLengthModifier,
      scenario.numberOfRuns,
      {
        _CLOUD_SCENARIO: scenario.name,
        _CLOUD_PROJECT:
          scenario.project?.name ?? this.marxanDefaults._CLOUD_PROJECT,
        _CLOUD_ORGANIZATION:
          scenario.project?.organization?.name ??
          this.marxanDefaults._CLOUD_ORGANIZATION,
        _CLOUD_GENERATED_AT: new Date().toISOString(),
        VERBOSITY: this.marxanDefaults.VERBOSITY,
        SAVESOLUTIONSMATRIX: this.marxanDefaults.SAVESOLUTIONSMATRIX,
        SAVERUN: this.marxanDefaults.SAVERUN,
        SAVEBEST: this.marxanDefaults.SAVEBEST,
        SAVESUMMARY: this.marxanDefaults.SAVESUMMARY,
        SAVESCEN: this.marxanDefaults.SAVESCEN,
        SAVETARGMET: this.marxanDefaults.SAVETARGMET,
        SAVESUMSOLN: this.marxanDefaults.SAVESUMSOLN,
        SAVELOG: this.marxanDefaults.SAVELOG,
        SAVESNAPSTEPS: this.marxanDefaults.SAVESNAPSTEPS,
        SAVESNAPCHANGES: this.marxanDefaults.SAVESNAPCHANGES,
        SAVESNAPFREQUENCY: this.marxanDefaults.SAVESNAPFREQUENCY,
        ...scenario.metadata?.marxanInputParameterFile,
      },
    );
    return inputParameterFile.toString();
  }

  settings() {
    return this.ioSettings;
  }
}
