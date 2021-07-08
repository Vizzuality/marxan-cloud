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
    const latest = await this.executionMetadataRepo.findOne({
      where: {
        scenarioId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!latest) {
      throw new Error('Not found');
    }
    if (!latest.outputZip) {
      throw new Error('Not available yet. Please execute Marxan first.');
    }
    return latest.outputZip;
  }
}
