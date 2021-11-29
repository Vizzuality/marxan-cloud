import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { AppConfig } from '@marxan-api/utils/config.utils';

export const simpleGeometry = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>('fileUploads.limits.singleGeometry', 1048576))(),
});

export const complexGeometry = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.complexGeometryWithoutProperties',
      10485760,
    ))(),
});

export const complexGeometryWithProperties = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.complexGeometryWithProperties',
      20971520,
    ))(),
});
