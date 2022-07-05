import { PuvsprCalculationsRepository } from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { PuvsprDat } from './puvsrpr.dat';

@Injectable()
export class PuvsprDatMarxanProject implements PuvsprDat {
  constructor(
    private readonly puvsprCalculationsRepo: PuvsprCalculationsRepository,
  ) {}
  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ) {
    return this.puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeature(
      projectId,
      featureIds,
    );
  }
}
