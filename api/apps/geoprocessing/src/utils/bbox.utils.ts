import { BBox } from 'geojson';
/**
 * Utility functions related to lower-level interaction with bbox operations.
 *
 * @debt This should be moved to a self-standing
 * @debt there is also a mismatch in terms of the bbox creation [xmax,xmin,ymax,ymin] vs [xmin,xmax,ymin,ymax]
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

/**
 * Check of antimeridian and division of bbox
 * to Nominatim bbox  [xmin, xmax, ymin, ymax].
 * @param bbox
 * @returns {BBox, BBox} west and east bbox split
 *
 */
export function antimeridianBbox(bbox: BBox): {westBbox: BBox, eastBbox: BBox} {
  if (bbox[2] > bbox[0]) {
    return {westBbox: [bbox[0], bbox[1], bbox[2] - 360, bbox[3]],
            eastBbox: [bbox[0] + 360, bbox[1], bbox[2], bbox[3]]};
  }
  return {westBbox: bbox, eastBbox: bbox}
}
