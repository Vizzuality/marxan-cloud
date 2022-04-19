import { QueryClient } from 'react-query';

import { getSession } from 'next-auth/client';
import { dehydrate } from 'react-query/hydration';

import PROJECTS from 'services/projects';

import { mergeDehydratedState } from './utils';

const fetchProject = (session, queryClient, { pid }) => {
  return queryClient.prefetchQuery(['projects', pid], () => PROJECTS.request({
    method: 'GET',
    url: `/${pid}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })
    .then((response) => {
      return response.data;
    }));
};

export function withProject(getServerSidePropsFunc?: Function) {
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

    await fetchProject(session, queryClient, { pid });
    const project = queryClient.getQueryData(['projects', pid]);

    if (!project) {
      return {
        props: {},
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      };
    }

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
