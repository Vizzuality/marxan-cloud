import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jaccard = require('jaccard-index');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const agglo = require('agglo');

import { ResultRow } from '@marxan/marxan-output';

@Injectable()
export class MostDifferentService {
  map(fromState: ResultRow[]): ResultRow[] {
    const mostDifferent: number[] = [];

    const jaccard = new Jaccard();
    const jaccardDistanceIndexMatrix = [];

    console.log(
      `Given scores:`,
      fromState.map((s) => `#${s.runId} => ${s.score}`),
    );

    for (const solution of fromState) {
      const solutionItems = solution.score.toString().split('');
      jaccardDistanceIndexMatrix.push(
        fromState.map((compareToSolution) => {
          // const u = jaccard.index(
          //   solutionItems,
          //   compareToSolution.score.toString().split(''),
          // );

          /**
           * TODO (?) enhance calcSim to base on objects like
           * {
           *   runId: number,
           *   value: (score or whatever we want)
           * }
           *
           * but does it make sense? runId would be also used in clustering..
           *
           */
          return calcSim(
            solutionItems,
            compareToSolution.score.toString().split(''),
          );
        }),
      );
    }

    console.log(jaccardDistanceIndexMatrix);

    // given the distance matrix, we can cluster the solutions

    /**
     * TODO think about getting:
     * - 5 solutions (no need to calculate?)
     * - less than 5 - can't get 5 most different?
     */
    const clusters: { clusters: any[] }[] = agglo(jaccardDistanceIndexMatrix, {
      maxLinkage: 5,
    });

    const targetClusters = clusters.find(
      (cluster) => cluster.clusters.length === 5,
    )?.clusters;

    console.log(`targetClusters`, targetClusters);

    console.log(
      `each cluster items:`,
      targetClusters?.map((c) => c.length),
    );

    return fromState.map((row) =>
      Object.assign<ResultRow, Pick<ResultRow, 'distinctFive'>>(row, {
        distinctFive: mostDifferent.includes(row.runId),
      }),
    );
  }
}

function calcSim(arr1: string[], arr2: string[]) {
  // Assuming each array is an array of integers which may contain duplicates
  // Can assume radix sort for Integers is O(n)
  let sorted1 = arr1.sort(); // O(n)
  let sorted2 = arr2.sort(); // O(m)

  sorted1 = sorted1.filter(function (x, i, a) {
    return x !== a[i - 1];
  }); // O(n)
  sorted2 = sorted2.filter(function (x, i, a) {
    return x !== a[i - 1];
  }); // O(m)
  let i = 0,
    j = 0,
    intersection = 0,
    item1 = null,
    item2 = null;

  while (i < sorted1.length && j < sorted2.length) {
    // O(MAX(m,n))

    item1 = sorted1[i];
    item2 = sorted2[j];

    if (item1 === item2) {
      intersection += 1;
      i++;
      j++;
    } else if (item1 < item2) i++;
    // item2 > item1
    else j++;
  }

  const total = sorted1.length + sorted2.length, // O(1)
    union = total - intersection; // O(1)

  return intersection / union;
}
