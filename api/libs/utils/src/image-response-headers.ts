import { Response } from 'express';

/**
 * Set response headers for endpoints that return png images as payload.
 */
export const setImagePngResponseHeadersForSuccessfulRequests = (
  res: Response,
) => {
  res.setHeader('Content-Type', 'image/png');
};
