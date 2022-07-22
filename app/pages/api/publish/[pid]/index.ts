import { getSession } from 'next-auth/client';

import PROJECTS from 'services/projects';

export default async function handler(req, res) {
  const session = await getSession({ req });

  const baseUrl = process.env.NEXT_PUBLIC_URL || req.headers.origin;

  const { pid } = req.query;

  try {
    await PROJECTS.request({
      method: 'POST',
      url: `${pid}/publish`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        Cookie: req?.headers?.cookie,
      },
      data: {
        ...req.body,
        config: {
          baseUrl,
        },
      },
    });
  } catch (error) {
    res.status(error.response.status).send(error.response.statusText);
    return;
  }

  res.status(200).send({});
}
