import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { minBy } from 'lodash';
import { ResultRow } from '@marxan/marxan-output';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clusterData, averageDistance } from '@greenelab/hclust';
import { isDefined } from '@marxan/utils';

type TargetCluster<T = ResultRow[]> = [T, T, T, T, T];
type SolutionPerClusterGroup<T = ResultRow> = TargetCluster<T>;

@Injectable()
export class MostDifferentService {
  map(fromState: ResultRow[]): ResultRow[] {
    if (fromState.length <= 5) {
      return fromState.map((state) =>
        plainToClass(ResultRow, {
          ...state,
          distinctFive: true,
        }),
      );
    }

    const targetCluster = this.#getClusterOfFiveGroup(fromState);

    if (!targetCluster) {
      // TODO @alicia @andrea - what if desired cluster was not found?
      // for whatever reason, library couldn't divide it and a cluster of 5
      // groups was not resolved
      return fromState;
    }
    const selectedSolutions = this.#getSolutionsFromCluster(targetCluster)?.map(
      (solution) => solution.runId,
    );

    // TODO @alicia @andrea - what if we couldn't get the 'desired' item
    //  from group? (very unlikely but possible - group has 0 members)
    if (!selectedSolutions) {
      return fromState;
    }

    return fromState.map((state) =>
      plainToClass(ResultRow, {
        ...state,
        distinctFive: selectedSolutions.includes(state.runId),
      }),
    );
  }

  #getClusterOfFiveGroup = (
    solutions: ResultRow[],
  ): TargetCluster | undefined => {
    const clusters = clusterData({
      data: solutions.map((state) => ({
        raw: state,
      })),
      key: 'raw',
      distance: (setA: ResultRow, setB: ResultRow) =>
        Math.abs(setA.score - setB.score),
      linkage: (setA: number[], setB: number[], distanceMatrix: number[][]) =>
        averageDistance(setA, setB, distanceMatrix),
    });

    const fiveGroups = clusters.clustersGivenK[5];

    if (!fiveGroups) {
      return;
    }

    return fiveGroups.map((indices: number[]) =>
      indices.map((index) => solutions[index]),
    );
  };

  #getSolutionsFromCluster = (
    cluster: TargetCluster,
  ): SolutionPerClusterGroup | undefined => {
    // .map works on generic arrays, fixed-sized ones types are lost (TS 4.1.2)
    const selectedSolutions = cluster.map((group) =>
      minBy(group, (element) => element.score),
    ) as SolutionPerClusterGroup<ResultRow | undefined>;

    if (this.#hasResultRows(selectedSolutions)) {
      return selectedSolutions;
    }
    return;
  };

  #hasResultRows = (
    cluster: SolutionPerClusterGroup<ResultRow | undefined>,
  ): cluster is SolutionPerClusterGroup =>
    cluster.every((element) => isDefined(element));
}
