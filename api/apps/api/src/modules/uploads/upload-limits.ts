import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { AppConfig } from '@marxan-api/utils/config.utils';

/**
 * Simple MiB to bytes conversion. Only for internal use:
 */
const mebibytesToBytes = (mebibytes: number): number => {
  return mebibytes * 1024 * 1024;
};

export const simpleGeometry = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.singleGeometry',
      mebibytesToBytes(1),
    ))(),
});

export const complexGeometry = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.complexGeometryWithoutProperties',
      mebibytesToBytes(10),
    ))(),
});

export const complexGeometryWithProperties = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.complexGeometryWithProperties',
      mebibytesToBytes(20),
    ))(),
});
