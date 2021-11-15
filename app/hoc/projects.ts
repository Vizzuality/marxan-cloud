import { QueryClient } from 'react-query';

import { getSession } from 'next-auth/client';
import { dehydrate } from 'react-query/hydration';

import PROJECTS from 'services/projects';

import { mergeDehydratedState } from './utils';

export function withPublishedProject(getServerSidePropsFunc?: Function) {
  return async (context: any) => {
    const session = await getSession(context);

    const { params } = context;

    const { pid } = params;

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['published-projects', pid], () => PROJECTS.request({
      method: 'GET',
      url: `/published/${pid}`,
    }).then((response) => {
      return response.data;
    }));

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context) || {};

      const { dehydratedState: prevDehydratedState } = SSPF.props;
      const currentDehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));

      const newDehydratedState = mergeDehydratedState(prevDehydratedState, currentDehydratedState);

      return {
        ...SSPF,
        props: {
          session,
          ...SSPF.props,
          dehydratedState: newDehydratedState,
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
