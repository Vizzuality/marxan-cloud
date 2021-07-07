import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class OutputFilesService {
  constructor(
    @InjectRepository(
      MarxanExecutionMetadataGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly executionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
  ) {}

  async get(scenarioId: string): Promise<Buffer> {
    const latest = await this.executionMetadataRepo.find({
      where: {
        scenarioId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 1,
    });
    if (latest.length !== 1) {
      throw new Error('Not found');
    }
    if (!latest[0].outputZip) {
      throw new Error('Not available yet. Please execute Marxan first.');
    }
    return latest[0].outputZip;
  }
}
