import { Readable } from 'stream';
import { readFileSync, copyFileSync } from 'fs';
import { AppConfig } from '../../../../src/utils/config.utils';

export const shapes = {
  invalid: () => resolveFile('invalid_coordinates'),
  valid: () => resolveFile('test_multiple_features_v2'),
};

/**
 * as FileService uses filename
 * and ShapefileService uses path
 * we need to manually keep those in sync with file on disk
 *
 *
 * Shapefile contains Polygon, thus should be transformed
 *
 */
const resolveFile = (
  fileName: 'invalid_coordinates' | 'test_multiple_features_v2',
): Express.Multer.File => {
  const baseDir = AppConfig.get<string>(
    'storage.sharedFileStorage.localPath',
  ) as string;
  const shapePath = baseDir + `/${fileName}.zip`;
  copyFileSync(__dirname + `/${fileName}.zip`, baseDir + `/${fileName}.zip`);
  const shapefile = readFileSync(shapePath);

  return {
    filename: fileName,
    buffer: shapefile,
    mimetype: 'application/zip',
    path: shapePath,
    destination: baseDir,
    fieldname: 'attachment',
    size: shapefile.length,
    originalname: `${fileName}.zip`,
    stream: Readable.from(shapefile),
    encoding: '',
  };
};
