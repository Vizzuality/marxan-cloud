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

/**
 * Project-archive and feature-CSV upload limits.
 *
 * These MUST stay in sync with the frontend constants in
 * `app/constants/file-uploader-size-limits.js`:
 *   - projectImport    <-> PROJECT_UPLOADER_MAX_SIZE       (1 GiB / 1073741824)
 *   - featureCsvUpload  <-> FEATURES_UPLOADER_CSV_MAX_SIZE  (50 MiB / 52428800)
 * Overridable per-environment via API_UPLOAD_PROJECT_IMPORT_MAX_SIZE /
 * API_UPLOAD_FEATURE_CSV_MAX_SIZE (values in bytes).
 */
export const projectImport = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.projectImport',
      mebibytesToBytes(1024),
    ))(),
});

export const featureCsvUpload = (): MulterOptions['limits'] => ({
  fileSize: (() =>
    AppConfig.get<number>(
      'fileUploads.limits.featureCsvUpload',
      mebibytesToBytes(50),
    ))(),
});
