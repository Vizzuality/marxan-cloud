import { NextApiRequest, NextApiResponse } from 'next';

import DOWNLOADS from 'services/downloads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_URL;

  const { sid, solutionId } = req.query as {
    sid: string;
    solutionId: string;
  };

  const { data: pdf } = await DOWNLOADS.request<ArrayBuffer>({
    method: 'POST',
    url: `/scenarios/${sid}/solutions/report`,
    responseType: 'arraybuffer',
    headers: {
      ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
      'Content-Type': 'application/json',
      Cookie: req?.headers?.cookie,
    },
    data: {
      baseUrl,
      reportOptions: {
        solutionId,
      },
    },
  });

  res.status(200).send(Buffer.from(pdf));
}
