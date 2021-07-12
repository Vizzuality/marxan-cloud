import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoteScenarioFeaturesData } from '@marxan-api/modules/scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

@Injectable()
export class SpecDatService {
  constructor(
    @InjectRepository(RemoteScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly scenarioFeaturesData: Repository<RemoteScenarioFeaturesData>,
    @InjectRepository(GeoFeature)
    private readonly geoFeatures: Repository<GeoFeature>,
  ) {
    //
  }

  async getSpecDatContent(_scenarioId: string): Promise<string> {
    return 'id\tprop\ttarget\tspf\tname\n';
  }
}
