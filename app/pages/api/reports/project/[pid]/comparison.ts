import { NextApiRequest, NextApiResponse } from 'next';

import DOWNLOADS from 'services/downloads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = req.headers.origin;

  console.log('Hello');
  const { sid1, sid2 } = req.query as {
    sid1: string;
    sid2: string;
  };

  console.log('sid1', sid1, 'sid2', sid2);
  const { data: pdf } = await DOWNLOADS.request<ArrayBuffer>({
    method: 'GET',
    url: `/projects/comparison-map/${sid1}/compare/${sid2}`,

    responseType: 'arraybuffer',
    headers: {
      ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
      'Content-Type': 'application/json',
      Cookie: req?.headers?.cookie,
    },
    data: {
      baseUrl,
      pdfOptions: {
        landscape: true,
      },
    },
  });

  res.status(200).send(Buffer.from(pdf));
}
