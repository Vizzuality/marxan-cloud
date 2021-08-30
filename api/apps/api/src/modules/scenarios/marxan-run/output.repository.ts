import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExecutionResult,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { Repository } from 'typeorm';
import { assertDefined } from '@marxan/utils';

@Injectable()
export class OutputRepository {
  constructor(
    @InjectRepository(ScenariosOutputResultsApiEntity)
    private readonly outputs: Repository<ScenariosOutputResultsApiEntity>,
  ) {}

  async saveOutput(job: {
    returnvalue: ExecutionResult | undefined;
    data: {
      scenarioId: string;
    };
  }) {
    const { returnvalue: output, data } = job;
    assertDefined(output);
    const entities: Omit<ScenariosOutputResultsApiEntity, 'id'>[] = output.map(
      (row) => ({
        ...row,
        scoreValue: row.score,
        costValue: row.cost,
        scenarioId: data.scenarioId,
      }),
    );
    await this.outputs.delete({
      scenarioId: data.scenarioId,
    });
    await this.outputs.save(entities);
  }
}
