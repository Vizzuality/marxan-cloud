import { LegacyProjectImportRepository } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { ResourceId } from '@marxan/cloning/domain';
import {
  PuvsprCalculationsRepository,
  PuvsprCalculationsService,
} from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { isRight } from 'fp-ts/lib/Either';

@Injectable()
export class ComputeArea {
  constructor(
    private readonly puvsprCalculationsRepo: PuvsprCalculationsRepository,
    private readonly puvsprCalculations: PuvsprCalculationsService,
    private readonly legacyProjectImportRepo: LegacyProjectImportRepository,
  ) {}
  public async computeAreaPerPanningUnitOfFeature(
    projectId: string,
    scenarioId: string,
    featureId: string,
  ) {
    const isLegacyProject = await this.isLegacyProject(projectId);

    if (isLegacyProject) return;

    const alreadyComputed = await this.puvsprCalculationsRepo.areAmountPerPlanningUnitAndFeatureSaved(
      projectId,
      featureId,
    );

    if (alreadyComputed) return;

    const amountPerPlanningUnitOfFeature = await this.puvsprCalculations.computeMarxanAmountPerPlanningUnit(
      featureId,
      scenarioId,
    );

    return this.puvsprCalculationsRepo.saveAmountPerPlanningUnitAndFeature(
      projectId,
      amountPerPlanningUnitOfFeature,
    );
  }

  private async isLegacyProject(projectId: string) {
    const legacyProjectImportOrError = await this.legacyProjectImportRepo.find(
      new ResourceId(projectId),
    );

    return isRight(legacyProjectImportOrError);
  }
}
