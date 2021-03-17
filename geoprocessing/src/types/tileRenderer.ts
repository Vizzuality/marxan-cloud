// import { TileInput } from './tileInput';

/**
 * @description This function creates the MVT tiles from the appropriate TileInput
 */
// export type TileRenderer = (args: TileInput) => Promise<ArrayBuffer>;

export interface Vectortile {
  res: number;
  data?: Buffer;
  status?: string;
}

/**
 * The specification of the tile request
 */
export interface TileRequest {
  /**
   * @description The zoom level ranging from 0 - 20
   */
  z: number;

  /**
   * @description The tile x offset on Mercator Projection
   */
  x: number;

  /**
   * @description The tile y offset on Mercator Projection
   */
  y: number;
}

/**
 * @description Input interface for the tile query builder
 */
export interface ITileQuery {
  x: number;
  y: number;
  z: number;
  table: string;
  geometry: string;
  extent: number;
  // attributes: string;
}

/**
 * @description The tile query builder callback definition
 */
export type GetTileQuery = (input: ITileQuery) => string;

/**
 * @description Input interface for the base query builder
 */
export interface IBaseQueryInput {
  x: number;
  y: number;
  z: number;
  table: string;
  geometry: string;
  maxZoomLevel: number;
  // attributes: string;
  // query: string[];
}

/**
 * @description The base query builder callback definition
 */
export type GetBaseQuery = (input: IBaseQueryInput) => string;
