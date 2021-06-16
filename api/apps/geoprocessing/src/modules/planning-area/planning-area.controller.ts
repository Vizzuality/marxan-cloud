import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiConsumesShapefile } from '@marxan-geoprocessing/decoratos/shapefile.decorator';
import { ShapefileGeoJSONResponseDTO } from '@marxan-geoprocessing/modules/shapefiles/dto/shapefile.geojson.response.dto';
import { ShapefileService } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.service';
import { PlanningAreaService } from '@marxan-geoprocessing/modules/planning-area/planning-area.service';
import {apiGlobalPrefixes} from "@marxan-geoprocessing/api.config";

@Controller(`${apiGlobalPrefixes.v1}/planning-area`)
export class PlanningAreaController {

  constructor(private planningAreaService: PlanningAreaService) {

  }
  @ApiConsumesShapefile()
  @Post('shapefile')
  async getPlanningAreaFromShapefile(
    @Body() shapefileInfo: Express.Multer.File,
  ): Promise<any> {
    console.log('REACHING GEOPROCESSING')
    return shapefileInfo
    }
  }

