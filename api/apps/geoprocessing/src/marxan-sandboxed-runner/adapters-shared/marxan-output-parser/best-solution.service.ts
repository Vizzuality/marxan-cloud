import { Injectable } from '@nestjs/common';
import { minBy } from 'lodash';
import { ResultWithBestSolution, ParsedRow } from '@marxan/marxan-output';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BestSolutionService {
  map(fromState: ParsedRow[]): ResultWithBestSolution[] {
    const bestRun = minBy(fromState, (solution) => solution.score)?.runId;

    return fromState.map((state) =>
      plainToClass(ResultWithBestSolution, {
        ...state,
        best: state.runId === bestRun,
      }),
    );
  }
}
