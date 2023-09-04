import { NextApiRequest, NextApiResponse } from 'next';

import DOWNLOADS from 'services/downloads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_URL;

  const { sid1, sid2 } = req.query as {
    sid1: string;
    sid2: string;
  };

  const { data: pdf } = await DOWNLOADS.request<ArrayBuffer>({
    method: 'POST',
    url: `/projects/comparison-map/${sid1}/compare/${sid2}`,
    responseType: 'arraybuffer',
    headers: {
      ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
      'Content-Type': 'application/json',
      Cookie: req?.headers?.cookie,
    },
    data: {
      baseUrl,
    },
  });

  res.status(200).send(Buffer.from(pdf));
}
