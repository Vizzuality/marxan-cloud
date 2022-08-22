import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  ResultRow,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { EntityManager, Repository } from 'typeorm';
import { assertDefined } from '@marxan/utils';
import { chunk } from 'lodash';
import { CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS } from '@marxan-api/utils/chunk-size-for-batch-apidb-operations';

@Injectable()
export class OutputRepository {
  constructor(
    @InjectRepository(ScenariosOutputResultsApiEntity)
    private readonly outputs: Repository<ScenariosOutputResultsApiEntity>,
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
  ) {}

  async saveOutput(job: {
    returnvalue: ResultRow[] | undefined;
    data: {
      scenarioId: string;
    };
  }) {
    const { returnvalue: output, data } = job;
    assertDefined(output);

    return this.apiEntityManager.transaction(async (transaction) => {
      await transaction.delete(ScenariosOutputResultsApiEntity, {
        scenarioId: data.scenarioId,
      });
      for (const [, summaryChunks] of chunk(
        output,
        CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS,
      ).entries()) {
        await transaction.insert(
          ScenariosOutputResultsApiEntity,
          summaryChunks.map((chnk) => ({
            ...chnk,
            scoreValue: chnk.score,
            costValue: chnk.cost,
            scenarioId: data.scenarioId,
          })),
        );
      }
    });
  }
}
