import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAreasModule } from 'src/modules/admin-areas/admin-areas.module';
import { ProtectedAreasModule } from 'src/modules/protected-areas/protected-areas.module';
import { PlanningUnitsModule } from 'src/modules/planning-units/planning-units.module';
import { TileModule } from './modules/tile/tile.module';
import { FeaturesModule } from 'src/modules/features/features.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...geoprocessingConnections.default,
      keepConnectionAlive: true,
    }),
    TypeOrmModule.forRoot({
      ...geoprocessingConnections.apiDB,
      keepConnectionAlive: true,
    }),
    AdminAreasModule,
    PlanningUnitsModule,
    TileModule,
    ProtectedAreasModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
