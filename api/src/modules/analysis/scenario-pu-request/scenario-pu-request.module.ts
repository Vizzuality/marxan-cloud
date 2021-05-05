import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConnections } from '../../../ormconfig.connections';
import { ScenarioPuRequestGeo } from './entity/scenario-pu-request.geo.entity';
import { ScenarioPuRequestsService } from './scenario-pu-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ScenarioPuRequestGeo],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [ScenarioPuRequestsService],
  exports: [ScenarioPuRequestsService],
})
export class ScenarioPuRequestModule {}
