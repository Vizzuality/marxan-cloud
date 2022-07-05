import { LegacyProjectImportRepository } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { ResourceId } from '@marxan/cloning/domain';
import { assertDefined } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isRight } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { Scenario } from '../scenario.api.entity';
import {
  PuvrsprDatRow,
  PuvsprDatProcessor,
} from './puvspr.dat.processor/puvspr.dat.processor';

@Injectable()
export class PuvsprDatService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
    private readonly puvsprDatProcessor: PuvsprDatProcessor,
  ) {}

  public async getPuvsprDatContent(scenarioId: string): Promise<string> {
    const [scenario] = await this.scenarioRepo.find({ id: scenarioId });
    assertDefined(scenario);

    const projectId = scenario.projectId;

    const isLegacyProject = await this.isLegacyProject(projectId);

    const puvsprRows = await this.puvsprDatProcessor.getPuvsprDatRows(
      isLegacyProject,
      scenarioId,
      projectId,
    );

    return this.getFileContent(puvsprRows);
  }

  private async isLegacyProject(projectId: string) {
    const legacyProjectImportOrError = await this.legacyProjectImportRepo.find(
      new ResourceId(projectId),
    );

    return isRight(legacyProjectImportOrError);
  }

  private getFileContent(rows: PuvrsprDatRow[]) {
    return (
      'species\tpu\tamount\n' +
      rows
        .map(
          ({ specieId, puid, amount }) =>
            `${specieId}\t${puid}\t${amount.toFixed(6)}`,
        )
        .join('\n')
    );
  }
}
