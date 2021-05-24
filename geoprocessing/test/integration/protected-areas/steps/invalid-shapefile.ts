import { readFileSync } from 'fs';
import { Readable } from 'stream';

export const shapePath = __dirname + `/new-shape-name.zip`;
export const shapefile = readFileSync(shapePath);

/**
 * as FileService uses filename
 * and ShapefileService uses path
 * we need to manually keep those in sync with file on disk
 *
 *
 * Shapefile contains Polygon, thus should be transformed
 *
 */
export const file: Express.Multer.File = {
  filename: `new-shape-name`,
  buffer: shapefile,
  mimetype: 'application/zip',
  path: shapePath,
  destination: __dirname,
  fieldname: 'attachment',
  size: shapefile.length,
  originalname: 'new-shape-name.zip',
  stream: Readable.from(shapefile),
  encoding: '',
};
