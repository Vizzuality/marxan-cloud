import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ScenarioPuvsprGeoEntity } from '@marxan/scenario-puvspr';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class PuvsprDatService {
  constructor(
    @InjectRepository(ScenarioPuvsprGeoEntity, DbConnections.geoprocessingDB)
    private readonly puvsprRepo: Repository<ScenarioPuvsprGeoEntity>,
  ) {}

  async getPuvsprDatContent(scenarioId: string): Promise<string> {
    const rows = await this.puvsprRepo.find({
      where: {
        scenarioId,
      },
    });
    return (
      'species\tpu\tamount\n' +
      rows
        .map((row) => `${row.featureId}\t${row.puId}\t${row.amount.toFixed(6)}`)
        .join('\n')
    );
  }
}
