import { Injectable } from '@nestjs/common';
import { PlanningUnitsService } from '../planning-units/planning-units.service';
import { AsyncJob, JobStatus } from './async-job';
import { ArePuidsAllowed } from './are-puids-allowed';
import { AnalysisInput } from './analysis-input';

type Success = true;

@Injectable()
export class AnalysisService {
  constructor(
    // TODO Inject Base Service for processing entity config
    private readonly puUuidValidator: ArePuidsAllowed,
    private readonly jobScheduler: PlanningUnitsService,
  ) {}

  /**
   * we could use Either from fp-ts as a return value
   */
  async update(
    scenarioId: string,
    constraints: AnalysisInput,
  ): Promise<Success> {
    const targetPuIds = [
      ...(constraints.include?.pu ?? []),
      ...(constraints.exclude?.pu ?? []),
    ];
    if (targetPuIds.length > 0) {
      await this.puUuidValidator.validate(scenarioId, targetPuIds);
    }

    // TODO add processing entity config creation

    // TODO should it trigger the job? (.executeCalculations)

    return true;
  }

  async executeCalculations(scenarioId: string): Promise<AsyncJob> {
    // await this.jobScheduler.create({
    //   /**??*/
    // });

    return {
      id: '0',
      status: JobStatus.Pending,
    };
  }
}
