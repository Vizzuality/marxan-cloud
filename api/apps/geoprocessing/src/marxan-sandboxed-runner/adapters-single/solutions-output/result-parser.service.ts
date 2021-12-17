import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ExecutionResult, ResultWithPUValues } from '@marxan/marxan-output';

import { MostDifferentService } from './most-different.service';
import { BestSolutionService } from '../../adapters-shared/marxan-output-parser/best-solution.service';
import { PlanningUnitsSelectionState } from './geo-output/solutions/planning-unit-selection-state';
import { MarxanOutputParserService } from '../../adapters-shared/marxan-output-parser/marxan-output-parser.service';

@Injectable()
export class ResultParserService {
  constructor(
    private readonly mostDifferentSolutions: MostDifferentService,
    private readonly bestSolution: BestSolutionService,
    private readonly marxanOutputParserService: MarxanOutputParserService,
  ) {}

  async parse(
    csvContent: string,
    planningUnitSelection: PlanningUnitsSelectionState,
  ): Promise<ExecutionResult> {
    const parsedRows = this.marxanOutputParserService.parse(csvContent);
    const rowsWithBestSolution = this.bestSolution.map(parsedRows);
    const rowsWithPUValues = rowsWithBestSolution.map((row) =>
      plainToClass(ResultWithPUValues, {
        ...row,
        puValues: planningUnitSelection.puUsageByRun[row.runId - 1] || [],
      }),
    );

    return this.mostDifferentSolutions.map(rowsWithPUValues);
  }
}
