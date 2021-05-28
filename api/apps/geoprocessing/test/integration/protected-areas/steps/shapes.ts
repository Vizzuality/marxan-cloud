import { Readable } from 'stream';
import { readFileSync } from 'fs';
import { AppConfig } from '../../../../src/utils/config.utils';

export const shapes = {
  invalid: () => resolveFile('new-shape-name'),
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
  fileName: 'new-shape-name' | 'test_multiple_features_v2',
): Express.Multer.File => {
  const baseDir = AppConfig.get<string>(
    'storage.sharedFileStorage.localPath',
  ) as string;
  // TODO copy files?
  const shapePath = baseDir + `/${fileName}.zip`;
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
