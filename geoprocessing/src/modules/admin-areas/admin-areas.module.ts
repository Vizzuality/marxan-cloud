// import { HttpModule, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// //import { AdminAreasController } from './admin-areas.controller';
// import { AdminArea } from './admin-area.geo.entity';
// import { AdminAreasService } from './admin-areas.service';
// import { VectorTileModule } from 'modules/vector-tile/vector-tile.service';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([AdminArea], 'geoprocessingDB'),
//     HttpModule.register({
//       maxContentLength: 100000000,
//     }),
//     VectorTileModule,
//   ],
//   providers: [AdminAreasService],
//   controllers: [AdminAreasController],
//   exports: [AdminAreasService],
// })
// export class AdminAreasModule {}
