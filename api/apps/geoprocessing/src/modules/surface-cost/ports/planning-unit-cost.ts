/**
 * when considering Shapefile metadata, properties names are limited to 10
 * characters:
 *
 * https://support.esri.com/en/technical-article/000022868#:~:text=This%20is%20a%20known%20limitation,character%20limitation%20for%20field%20names
 *
 * Thus, we shouldn't base on longer key names (like "planningUnitId")
 *
 * also, upperCase can cause troubles.
 */
export interface PlanningUnitCost {
  puid: number;
  puUuid: string;
  cost: number;
}
