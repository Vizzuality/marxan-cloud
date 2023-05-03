import { getSession } from 'next-auth/react';

import DOWNLOADS from 'services/downloads';

export default async function handler(req, res) {
  const session = await getSession({ req });

  const baseUrl = req.headers.origin;

  const { sid, solutionId } = req.query;

  const { data: pdf } = await DOWNLOADS.request({
    method: 'POST',
    url: `/scenarios/${sid}/solutions/report`,
    responseType: 'arraybuffer',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      Cookie: req?.headers?.cookie,
    },
    data: {
      baseUrl,
      pdfOptions: {
        landscape: true,
      },
      reportOptions: {
        solutionId,
      },
    },
  });

  res.status(200).send(Buffer.from(pdf));
}
