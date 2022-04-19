import { QueryClient } from 'react-query';

import { getSession } from 'next-auth/client';
import { dehydrate } from 'react-query/hydration';

import ROLES from 'services/roles';
import SCENARIOS from 'services/scenarios';
import USERS from 'services/users';

import { mergeDehydratedState } from './utils';

const fetchUser = (session, queryClient) => {
  return queryClient.prefetchQuery('me', () => USERS.request({
    method: 'GET',
    url: '/me',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })
    .then((response) => {
      if (response.status > 500) {
        return new Error('prefetchQuery "me" error');
      }
      return response.data;
    }));
};

const fetchProjectUsers = (session, queryClient, { pid }) => {
  return queryClient.prefetchQuery(['roles', pid], () => ROLES.request({
    method: 'GET',
    url: `/${pid}/users`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {},
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response.data;
  }));
};

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
    const scenario = queryClient.getQueryData<any>(['scenarios', sid]);

    if (!scenario) {
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

    const { pid, sid } = params;

    const queryClient = new QueryClient();

    await fetchUser(session, queryClient);
    await fetchScenarioLock(session, queryClient, { sid });
    await fetchProjectUsers(session, queryClient, { pid });

    const me = queryClient.getQueryData<any>(['me']);
    const projectUsers = queryClient.getQueryData<any>(['roles', pid]);

    if (!me || !projectUsers) {
      return {
        props: {},
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      };
    }

    const { data: meData } = me;
    const { data: projectUsersData } = projectUsers;
    const { data: scenarioLockData } = queryClient.getQueryData<any>(['scenario-lock', sid]);

    const meRole = projectUsersData.find((u) => u.user.id === meData.id)?.roleName;

    if (!scenarioLockData && meRole !== 'project_viewer') {
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
