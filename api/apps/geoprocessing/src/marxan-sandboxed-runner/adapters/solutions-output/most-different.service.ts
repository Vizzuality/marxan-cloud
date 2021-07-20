import { Injectable } from '@nestjs/common';
import { maxBy, minBy } from 'lodash';
import { ResultRow } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';

@Injectable()
export class MostDifferentService {
  map(fromState: ResultRow[]): ResultRow[] {
    const highestCostPerScore = minBy(fromState, (e) => e.cost / e.score);
    const lowestCostPerScore = maxBy(fromState, (e) => e.cost / e.score);
    const withHighestPuIncluded = maxBy(fromState, (e) => e.planningUnits);
    const mostDifferent = [
      highestCostPerScore?.runId,
      lowestCostPerScore?.runId,
      withHighestPuIncluded?.runId,
    ].filter(isDefined);
    return fromState.map((row) =>
      Object.assign<ResultRow, Pick<ResultRow, 'mostDifferent'>>(row, {
        mostDifferent: mostDifferent.includes(row.runId),
      }),
    );
  }
}
