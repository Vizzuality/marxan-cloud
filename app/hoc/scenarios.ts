import { QueryClient } from 'react-query';

import { getSession } from 'next-auth/client';
import { dehydrate } from 'react-query/hydration';

import SCENARIOS from 'services/scenarios';

import { mergeDehydratedState } from './utils';

const fetchScenario = (session, queryClient, { sid }) => {
  return queryClient.prefetchQuery(['scenarios', sid], () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }));
};

const fetchScenarioLock = (session, queryClient, { sid }) => {
  return queryClient.prefetchQuery(['scenario-lock', sid], () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/editing-locks`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response.data;
  }));
};

export function withScenario(getServerSidePropsFunc?: Function) {
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

    const { sid } = params;

    const queryClient = new QueryClient();

    await fetchScenario(session, queryClient, { sid });

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

export function withScenarioLock(getServerSidePropsFunc?: Function) {
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

    const { sid } = params;

    const queryClient = new QueryClient();

    await fetchScenarioLock(session, queryClient, { sid });

    const { data: scenarioLockData } = queryClient.getQueryData<any>(['scenario-lock', sid]);

    if (!scenarioLockData) {
      await SCENARIOS.request({
        method: 'POST',
        url: `/${sid}/lock`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        transformResponse: (data) => JSON.parse(data),
      });

      await fetchScenarioLock(session, queryClient, { sid });
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
