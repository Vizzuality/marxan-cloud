import { getSession } from 'next-auth/client';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import PROJECTS from 'services/projects';

export function withPublishedProject(getServerSidePropsFunc?: Function) {
  return async (context: any) => {
    const session = await getSession(context);

    if (!session) {
      if (getServerSidePropsFunc) {
        const SSPF = await getServerSidePropsFunc(context) || {};

        return {
          props: {
            ...SSPF.props,
          },
        };
      }

      return {
        props: {},
      };
    }

    const { params } = context;
    const { pid } = params;

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['published-projects', pid], () => PROJECTS.request({
      method: 'GET',
      url: `/projects/${pid}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then((response) => {
      return response.data;
    }));

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context) || {};

      return {
        props: {
          session,
          dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
          ...SSPF.props,
        },
      };
    }

    return {
      props: {
        session,
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  };
}
