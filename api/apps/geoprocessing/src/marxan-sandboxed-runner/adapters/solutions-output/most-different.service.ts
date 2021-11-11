import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { minBy,reduce } from 'lodash';
import { ResultRow } from '@marxan/marxan-output';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clusterData } from '@greenelab/hclust';
import { isDefined } from '@marxan/utils';


type TargetCluster<T = (ResultRow & {puValues: number[]})[]> = [T, T, T, T, T];
type SolutionPerClusterGroup<T = (ResultRow & {puValues: number[]})> = TargetCluster<T>;

const logger = new Logger('5 most different Test')
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
    logger.debug(fromState)
    return fromState.map((state) =>
      plainToClass(ResultRow, {
        ...state,
        distinctFive: selectedSolutions.includes(state.runId),
      }),
    );
  }

  #getClusterOfFiveGroup = (
    solutions: (ResultRow & {puValues: number[]}),
  ): TargetCluster | undefined => {
    const clusters = clusterData({
      data: solutions.map((state) => ({
        raw: state,
      })),
      key: 'raw',
      distance: (setA: (ResultRow & {puValues: number[]}), setB: (ResultRow & {puValues: number[]})): number => {
        return this.#getJaccardBinaryDistance(setA.puValues, setB.puValues);
      }),
      linkage: (setA: number[], setB: number[], distanceMatrix: number[][]): number =>
      this.#getMeanPairGroup(setA, setB, distanceMatrix),
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

  #getJaccardBinaryDistance = (setA: [],setB:[]): number => {
    if (setA.length !== setB.length) throw new Error("Need to be equal length");
    const response = reduce(
      setA,
      (accumulator: {a1:number, a2:number}, value:number, index:number):{a1:number, a2:number} => {
        const xor: number = +!(value ^ setB[index]); // inverse xor operation over binary par
        accumulator.a1 += xor;
        accumulator.a2 += xor & value;
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return accumulator;
      },
      { a1: 0, a2: 0 }
    );

    return 1 - response.a2 / (setA.length - (response.a1 - response.a2)); // jaccard distance
  };

  #getMeanPairGroup = (setA: number[], setB: number[], distances: number[][]): number => {
    let distance = 0;
    // methodology for linkage https://en.wikipedia.org/wiki/UPGMA
    for (const a of setA) {
      for (const b of setB) distance += distances[a][b];
    }

    return distance / (setA.length * setB.length);
  };
}
