import { NextApiRequest, NextApiResponse } from 'next';

import SCENARIOS from 'services/scenarios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || req.headers.origin;
  const { sid } = req.query as {
    sid: string;
  };
  const { range } = req.body as {
    range: [number, number];
  };

  await SCENARIOS.request({
    method: 'POST',
    url: `/${sid}/calibration`,
    headers: {
      ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
      'Content-Type': 'application/json',
      Cookie: req?.headers?.cookie,
    },
    data: {
      range,
      config: {
        baseUrl,
      },
    },
  });

  res.status(200).send({});
}
