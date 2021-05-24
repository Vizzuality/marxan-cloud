import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FileService } from '../files/files.service';
const mapshaper = require('mapshaper');

@Injectable()
export class ShapefileService {
  private readonly logger: Logger = new Logger(ShapefileService.name);
  constructor(private readonly fileService: FileService) {}

  private async shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    //try {
    const outputKey = `shapefile-${new Date().getTime()}.geojson`;

    const _geoJson = await mapshaper.applyCommands(
      `-i no-topology snap ${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp -clean rewind -info -o ${outputKey}`,
    );
    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  geoJsonHasGeometries(geoJson: any) {}
  async getGeoJson(shapeFile: Express.Multer.File) {
    try {
      this.logger.log(await this.fileService.unzipFile(shapeFile));
      const geoJson = await this.shapeFileToGeoJson(shapeFile);
      return { data: geoJson };
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Invalid Shapefile');
    } finally {
      await this.fileService
        .deleteDataFromFS(shapeFile.path)
        .catch((error) => this.logger.error(error));
    }
  }
}
