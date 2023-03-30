import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProjectSourcesEnum } from '@marxan/projects';
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
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    private readonly puvsprDatProcessor: PuvsprDatProcessor,
  ) {}

  public async getPuvsprDatContent(scenarioId: string): Promise<string> {
    const [scenario] = await this.scenarioRepo.find({
      where: { id: scenarioId },
    });
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
    const [project] = await this.projectsRepo.find({
      where: { id: projectId },
    });
    assertDefined(project);
    return project.sources === ProjectSourcesEnum.legacyImport;
  }

  private getFileContent(rows: PuvrsprDatRow[]) {
    return (
      'species\tpu\tamount\n' +
      rows
        .map(
          ({ speciesId, puId, amount }) =>
            `${speciesId}\t${puId}\t${amount.toFixed(6)}`,
        )
        .join('\n')
    );
  }
}
