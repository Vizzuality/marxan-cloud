import { Response } from 'express';

/**
 * Set response headers for endpoints that return vector tiles as protobuf body
 * payload.
 *
 * This is only needed for tile endpoints of the geoprocessing service, as those
 * of the API service act as plain proxies and set the response headers verbatim
 * from the upstream (geoprocessing) response headers.
 *
 * These headers should be set conditionally, only if the payload being sent is
 * actually MVT/protobuf. In case of validation errors, for example, we would be
 * sending a JSON payload with error details, in which case these headers won't
 * apply.
 *
 * `Content-Encoding: gzip` should apply for JSON responses too, so it may be
 * redundant here, but since we explicitly zip MVT/protobuf response payloads,
 * this header should be safer to set here, in case default content encoding
 * is changed (future NestJS versions, application-wide settings, etc).
 */
export const setTileResponseHeadersForSuccessfulRequests = (res: Response) => {
  res.setHeader('Content-Type', 'application/x-protobuf');
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('Content-Encoding', 'gzip');
};
