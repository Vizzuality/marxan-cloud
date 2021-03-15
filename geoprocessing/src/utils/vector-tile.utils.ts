// import { GetBaseQuery, IBaseQueryInput } from 'types/tileQuery';
// import { GetTileQuery, ITileQuery } from 'types/tileQuery';
// import zlib from 'zlib';

// /**
//  * @todo add pyramiding function
//  */

// /**
//  * @description The default base query builder
//  */
// export const defaultGetBaseQuery: GetBaseQuery = ({
//   x,
//   y,
//   z,
//   table,
//   geometry,
//   maxZoomLevel,
//   attributes,
//   query,
// }: IBaseQueryInput) => `
// SELECT
//   ${geometry} AS geom,
//   ${maxZoomLevel + 1} AS expansionZoom${attributes}
// FROM ${table}
// WHERE
// 	ST_Intersects(TileBBox(${z}, ${x}, ${y}, 3857), ST_Transform(${geometry}, 3857))
// 	${query.length > 0 ? `AND ${query.join(' AND ')}` : ''}
// `;

// /**
//  * @description The default tile query builder
//  */
// export const defaultGetTileQuery: GetTileQuery = ({
//   x,
//   y,
//   z,
//   table,
//   geometry,
//   extent,
//   // bufferSize,
//   attributes,
// }: ITileQuery) => `
// SELECT
//   ST_AsMVTGeom(ST_Transform(${geometry}, 3857), TileBBox(${z}, ${x}, ${y}, 3857), ${extent}, false) AS geom,
//   jsonb_build_object(
//     'count', size,
//     'expansionZoom', expansionZoom,
//     'lng', ST_X(ST_Transform(${geometry}, 4326)),
//     'lat', ST_Y(ST_Transform(${geometry}, 4326))${attributes}
//   ) AS attributes
// FROM ${table}
// `;


// /**
//  * @description Data compression
//  */

// export function zip(data: any): Promise<Buffer> {
//   return new Promise<Buffer>((resolve, reject) => {
//     zlib.gzip(data, (err, result) => {
//       if (err) {
//         return reject(err);
//       }

//       resolve(result);
//     });
//   });
// }

// // /**
// //  * @description The dafault implementation of zoom to distance
// //  */
// // export const defaultZoomToDistance = (zoomLevel: number, radius: number = 15) =>
// //   radius / Math.pow(2, zoomLevel);

// /**
//  * @description Creates an SQL fragment of the dynamic attributes to an sql select statement
//  */
// export const attributesToSelect = (attributes: string[]) =>
//   attributes.length > 0 ? `, ${attributes.join(', ')}` : '';

// /**
//  * @description Creates an SQL fragmemt which selects the first value of an attribute using the FIRST aggregate function
//  */
// // export const attributesFirstToSelect = (attributes: string[]) =>
// //   attributes.length > 0
// //     ? `${attributes
// //         .map((attribute) => `FIRST(${attribute}) as ${attribute}`)
// //         .join(', ')},`
// //     : '';

// /**
//  * @description Creates an SQL fragment that selects the dynamic attributes to be used by each zoom level query
//  */
// export const attributesToArray = (attributes: string[]) =>
//   attributes.length > 0
//     ? ', ' +
//       attributes.map((attribute) => `'${attribute}', ${attribute}`).join(', ')
//     : '';

