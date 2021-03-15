import { forwardRef, Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { AdminAreasModule } from 'src/modules/admin-areas/admin-areas.module';
=======
>>>>>>> WIP
import { PlanningUnitsModule } from 'src/modules/planning-units/planning-units.module';
import { AdminAreasModule } from 'src/modules/admin-areas/admin-areas.module';

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
    AdminAreasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
