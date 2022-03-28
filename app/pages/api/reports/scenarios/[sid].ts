import { getSession } from 'next-auth/client';

import DOWNLOADS from 'services/downloads';

export default async function handler(req, res) {
  const session = await getSession({ req });
  const baseUrl = process.env.NEXT_PUBLIC_URL || `${window.location.protocol}//${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  const { sid } = req.query;

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
    },
  });

  res.status(200).send(Buffer.from(pdf));
}
