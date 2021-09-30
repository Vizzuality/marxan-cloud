import { Injectable } from '@nestjs/common';
import { minBy } from 'lodash';
import { ResultRow } from '@marxan/marxan-output';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BestSolutionService {
  map(fromState: ResultRow[]): ResultRow[] {
    const bestRun = minBy(fromState, (solution) => solution.score)?.runId;

    return fromState.map((state) =>
      plainToClass(ResultRow, {
        ...state,
        best: state.runId === bestRun,
      }),
    );
  }
}
