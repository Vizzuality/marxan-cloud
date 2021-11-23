import { Injectable, Logger } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { Either, left, right } from 'fp-ts/Either';
import { readdir, readFile, unlink } from 'fs/promises';
import * as path from 'path';

import { FileService } from '@marxan/shapefile-converter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mapshaper = require('mapshaper');

type Shapefile = Pick<Express.Multer.File, 'path' | 'filename' | 'destination'>;
type UnpackedShapefile = Pick<Shapefile, 'path'>;

export const unzipArchiveError = Symbol(`unzip archive error`);
export const missingShapeFiles = Symbol(`missing shape files inside archive`);
export const conversionToGeoJsonError = Symbol(
  `MapShaper couldn't convert to GeoJson`,
);
export const unsupportedGeoJson = Symbol(`unsupported features`);

export type ExtractErrors =
  | typeof unzipArchiveError
  | typeof missingShapeFiles
  | typeof conversionToGeoJsonError
  | typeof unsupportedGeoJson;

/**
 * Due to current(original) ShapefileService which removes the archive
 * upon extracting and its heavy usage, we have standalone version
 * which allows consumer to decide about the removal
 *
 * Some duplication couldn't be avoided (or rather: would require to build
 * wrong abstraction)
 */
@Injectable()
export class ShapefileExtractorService {
  private readonly logger: Logger = new Logger(ShapefileExtractorService.name);
  private readonly minRequiredFiles = ['.prj', '.dbf', '.shx', '.shp'];

  constructor(private readonly fileService: FileService) {}

  async toGeoJson(archive: Shapefile): Promise<Either<ExtractErrors, GeoJSON>> {
    let extracted: UnpackedShapefile;
    let geoJson: GeoJSON;

    try {
      extracted = await this.unzip(archive);
    } catch (error) {
      this.logger.error(`Failed to unzip: ${archive.path} - ${error}`);
      return left(unzipArchiveError);
    }
    const valid = await this.containsRequiredFiles(extracted);

    if (!valid) {
      return left(missingShapeFiles);
    }

    try {
      geoJson = await this.convert(extracted);
    } catch (error) {
      this.logger.error(`Failed to convert: ${extracted.path} - ${error}`);
      return left(conversionToGeoJsonError);
    }

    const geoJsonValid = this.hasSupportedFeatures(geoJson);

    if (!geoJsonValid) {
      return left(unsupportedGeoJson);
    }

    return right(geoJson);
  }

  async cleanup(shapeFile: Shapefile): Promise<void> {
    await this.fileService.deleteDataFromFS(shapeFile.path).catch((error) => {
      this.logger.error(error);
    });
  }

  private async unzip(shapeFile: Shapefile): Promise<UnpackedShapefile> {
    await this.fileService.unzipFile(
      shapeFile.path,
      shapeFile.filename,
      shapeFile.destination,
    );
    return {
      path: shapeFile.path.replace('.zip', ''),
    };
  }

  private async containsRequiredFiles(
    shapeFile: UnpackedShapefile,
  ): Promise<boolean> {
    const filesInPath = await readdir(shapeFile.path);
    const extensions = filesInPath.map((file) => path.extname(file));
    return this.minRequiredFiles.every((ext: string) =>
      extensions.includes(ext),
    );
  }

  private async convert(shapeFile: UnpackedShapefile): Promise<GeoJSON> {
    const outputFile = path.join(
      shapeFile.path,
      `shapefile-${new Date().getTime()}.geojson`,
    );

    await mapshaper.runCommandsXL(
      `-i snap "${shapeFile.path}/*.shp" -proj EPSG:4326 -clean rewind -info -o "${outputFile}"`,
    );

    const geoJsonBuffer = await readFile(outputFile);
    await unlink(outputFile);
    return JSON.parse(geoJsonBuffer.toString('utf-8'));
  }

  private hasSupportedFeatures(geoJson: GeoJSON): boolean {
    return !(
      geoJson.type !== 'FeatureCollection' ||
      geoJson.features.every(
        (geom: any) =>
          geom.geometry?.type !== 'Polygon' &&
          geom.geometry?.type !== 'MultiPolygon',
      )
    );
  }
}
