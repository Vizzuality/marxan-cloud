/**
 * NOTE: The API defaults to multiples of MiBs
 *
 * See backend counterpart here:
 * https://github.com/Vizzuality/marxan-cloud/blob/develop/api/apps/api/src/modules/uploads/upload-limits.ts
 */

export const PLANNING_UNIT_UPLOADER_MAX_SIZE = 1048576; // 1MiB
export const PLANNING_AREA_UPLOADER_MAX_SIZE = 1048576; // 1MiB
export const PLANNING_AREA_GRID_UPLOADER_MAX_SIZE = 10485760; // 10MiB
export const PROTECTED_AREA_UPLOADER_MAX_SIZE = 10485760; // 10MiB
export const FEATURES_UPLOADER_MAX_SIZE = 20971520; // 20MiB
export const COST_SURFACE_UPLOADER_MAX_SIZE = 20971520; // 20MiB
