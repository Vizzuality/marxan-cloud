import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = req.headers.origin;

  const { sid1, sid2 } = req.query as {
    sid1: string;
    sid2: string;
  };

  console.log('sid1', sid1, 'sid2', sid2);

  // await SCENARIOS.request({
  //   method: 'POST',
  //   url: `/${sid}/calibration`,
  //   headers: {
  //     ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
  //     'Content-Type': 'application/json',
  //     Cookie: req?.headers?.cookie,
  //   },
  //   data: {
  //     config: {
  //       baseUrl,
  //     },
  //   },
  // });

  res.status(200).send({});
}
