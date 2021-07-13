import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoteScenarioFeaturesData } from '@marxan-api/modules/scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class SpecDatService {
  constructor(
    @InjectRepository(RemoteScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly scenarioFeaturesData: Repository<RemoteScenarioFeaturesData>,
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
    return (
      'id\ttarget\tprop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n' +
      rows
        .map((row) =>
          [
            row.featureId,
            (row.target ?? 0.0).toFixed(2),
            (row.prop ?? 0.0).toFixed(2),
            row.fpf.toFixed(2),
            row.target2 ?? '',
            row.targetocc ?? 0.0,
            '',
            row.sepNum ?? '',
            row.metadata?.sepdistance ?? '',
          ].join('\t'),
        )
        .join('\n')
    );
  }
}
