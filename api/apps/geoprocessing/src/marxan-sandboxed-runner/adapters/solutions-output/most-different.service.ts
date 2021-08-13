import { Injectable } from '@nestjs/common';
import { maxBy, minBy, take } from 'lodash';
import { ResultRow } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';

@Injectable()
export class MostDifferentService {
  map(fromState: ResultRow[]): ResultRow[] {
    const highestCostPerScore = minBy(fromState, (e) => e.cost / e.score);
    const lowestCostPerScore = maxBy(fromState, (e) => e.cost / e.score);
    const withHighestPuIncluded = maxBy(fromState, (e) => e.planningUnits);
    const mostDifferentTmp = [
      highestCostPerScore?.runId,
      lowestCostPerScore?.runId,
      withHighestPuIncluded?.runId,
    ].filter(isDefined);
    // Until we compute which solutions actually are the most different ones,
    // arbitrarily pick the first five (or up to five, if we have fewer
    // iterations).
    const mostDifferent = take(Array.from(Array(5).keys()), fromState.length).map(i => i+1);
    return fromState.map((row) =>
      Object.assign<ResultRow, Pick<ResultRow, 'distinctFive'>>(row, {
        distinctFive: mostDifferent.includes(row.runId),
      }),
    );
  }
}
