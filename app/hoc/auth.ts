import { QueryClient } from 'react-query';

import { getSession } from 'next-auth/client';
import { dehydrate } from 'react-query/hydration';

import USERS from 'services/users';

import { mergeDehydratedState } from './utils';

export function withProtection(getServerSidePropsFunc?: Function) {
  return async (context: any) => {
    const session = await getSession(context);
    const { resolvedUrl } = context;

    if (!session) {
      return {
        redirect: {
          destination: `/auth/sign-in?callbackUrl=${resolvedUrl}`,
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context, session);

      return {
        ...SSPF,
        props: {
          session,
          ...SSPF.props,
        },
      };
    }

    return {
      props: {
        session,
      },
    };
  };
}

export function withUser(getServerSidePropsFunc?: Function) {
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

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery('me', () => USERS.request({
      method: 'GET',
      url: '/me',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then((response) => {
        if (response.status > 400) {
          return new Error('prefetchQuery "me" error');
        }
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

export function withoutProtection(getServerSidePropsFunc?: Function) {
  return async (context: any) => {
    const session = await getSession(context);

    if (session) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      const SSPF = await getServerSidePropsFunc(context);

      return {
        ...SSPF,
        props: {
          ...SSPF.props,
        },
      };
    }

    return {
      props: {

      },
    };
  };
}
