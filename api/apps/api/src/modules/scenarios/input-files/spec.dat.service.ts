import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { SpecDataTsvFile } from './spec-dat-tsv-file';

@Injectable()
export class SpecDatService {
  constructor(
    @InjectRepository(ScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly scenarioFeaturesData: Repository<ScenarioFeaturesData>,
  ) {}

  async getSpecDatContent(scenarioId: string): Promise<string> {
    const rows = await this.scenarioFeaturesData.find({
      where: {
        scenarioId,
      },
      order: {
        featureId: 'ASC',
      },
    });

    const specDatFile = new SpecDataTsvFile();
    for (const row of rows) {
      specDatFile.addRow(row);
    }

    return specDatFile.toString();
  }
}
