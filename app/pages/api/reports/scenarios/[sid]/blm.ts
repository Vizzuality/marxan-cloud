import { getSession } from 'next-auth/client';

import SCENARIOS from 'services/scenarios';

export default async function handler(req, res) {
  const session = await getSession({ req });

  const baseUrl = process.env.NEXT_PUBLIC_URL || req.headers.origin;

  const { sid } = req.query;

  const { range } = req.body;

  await SCENARIOS.request({
    method: 'POST',
    url: `/${sid}/calibration`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
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

  res.status(200);
}
