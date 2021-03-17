import { forwardRef, Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAreasModule } from 'modules/admin-areas/admin-areas.module';

export const logger = new Logger('app');
logger.debug(AdminAreasModule);

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
