import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { geoprocessingConnections } from './ormconfig';
import { PlanningUnitsModule } from 'src/modules/planning-units/planning-units.module';

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
    PlanningUnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
