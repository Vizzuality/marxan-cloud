import { AxiosResponse, isAxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import PROJECTS from 'services/projects';

interface PublishProjectBody {
  name: string;
  description: string;
  location: string;
  creators: {
    avatarDataUrl: string;
    displayName: string;
    id: string;
    roleName: string;
  }[];
  // todo: improve typing of resources
  resources: object[];
  featuredScenarioId: string;
  company: string;
  config: {
    baseUrl: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || req.headers.origin;
  const { pid } = req.query as { pid: string };

  try {
    await PROJECTS.post<unknown, AxiosResponse<unknown>, PublishProjectBody>(
      `${pid}/publish`,
      {
        ...(req.body as PublishProjectBody),
        config: {
          baseUrl,
        },
      },
      {
        headers: {
          ...(req?.headers?.authorization && { Authorization: req.headers.authorization }),
          'Content-Type': 'application/json',
          Cookie: req?.headers?.cookie,
        },
      }
    );
  } catch (error) {
    if (isAxiosError(error)) {
      return res.status(error.response.status).send(error.response.statusText);
    }

    return res.status(500).send((error as Error).message);
  }

  res.status(200).send({});
}
