import { Response } from "express"

export const setTileResponseHeadersForSuccessfulRequests = (res: Response) => {
  res.setHeader('Content-Type', 'application/x-protobuf'),
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('Content-Encoding', 'gzip');
}