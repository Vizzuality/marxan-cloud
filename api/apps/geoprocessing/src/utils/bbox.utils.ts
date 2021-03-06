import { BBox } from 'geojson';
/**
 * Utility functions related to lower-level interaction with bbox operations.
 *
 * @debt This should be moved to a self-standing
 */

/**
 * conversion operation between bbox [xmin, ymin, xmax, ymax]
 * to Nominatim bbox  [xmin, xmax, ymin, ymax].
 *
 */
export function bbox2Nominatim(bbox: BBox): BBox {
  return [bbox[0], bbox[2], bbox[1], bbox[3]];
}
export function nominatim2bbox(nominatim: BBox): BBox {
  return [nominatim[0], nominatim[2], nominatim[1], nominatim[3]];
}
