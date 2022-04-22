import { useMemo } from 'react';

import {
  useMutation,
  useQuery, useQueryClient,
} from 'react-query';

import { useSession } from 'next-auth/client';

import ADMIN from 'services/admin';
// import TEST from 'services/test';

import {
  DeleteAdminUserProps,
  DeleteBlockUserProps,
  SaveAdminPublishedProjectProps,
  SaveAdminUserProps,
  SaveBlockUserProps,
  UseAdminPublishedProjectsProps,
  UseAdminUsersProps,
  UseDeleteAdminUserProps,
  UseDeleteBlockUserProps,
  UseSaveAdminPublishedProjectProps,
  UseSaveAdminUserProps,
  UseSaveBlockUserProps,
} from './types';

/**
 *
 *
 * USERS
 *
 *
*/
export function useAdminUsers(options: UseAdminUsersProps = { page: 1 }) {
  const [session] = useSession();

  const {
    page,
    search,
    filters = {},
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k].toString(),
      };
    }, {});

  const parsedSort = useMemo(() => {
    if (!sort) {
      return '';
    }

    const direction = sort.direction === 'asc' ? '-' : '';
    return `${direction}${sort.id}`;
  }, [sort]);

  const fetchUsers = () => ADMIN.request({
    method: 'GET',
    url: '/users',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': page,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...parsedSort && {
        sort: parsedSort,
      },
    },
  }).then((response) => response.data);

  const query = useQuery(['admin-users', JSON.stringify(options), page], fetchUsers, {
    retry: false,
    keepPreviousData: true,
    placeholderData: {
      data: [],
      meta: {} as any,
    },
    // TEST
    // placeholderData: [],
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
      meta: data?.meta,
    };
  }, [query, data]);
}

export function useSaveAdminUser({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveAdminUserProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveAdminUser = ({ uid }: SaveAdminUserProps) => {
    return ADMIN.request({
      url: `/users/admins/${uid}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveAdminUser, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('admin-users');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteAdminUser({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteAdminUserProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveAdminUser = ({ uid }: DeleteAdminUserProps) => {
    return ADMIN.request({
      method: 'DELETE',
      url: `/users/admins/${uid}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveAdminUser, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('admin-users');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useSaveBlockUser({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveBlockUserProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveBlockUser = ({ uid }: SaveBlockUserProps) => {
    return ADMIN.request({
      url: `/users/block/${uid}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveBlockUser, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('admin-users');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteBlockUser({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteBlockUserProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveBlockUser = ({ uid }: DeleteBlockUserProps) => {
    return ADMIN.request({
      method: 'DELETE',
      url: `/users/block/${uid}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveBlockUser, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('admin-users');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

/**
 *
 *
 * PUBLISHED PROJECTS
 *
 *
*/
export function useAdminPublishedProjects(options: UseAdminPublishedProjectsProps = { page: 1 }) {
  const [session] = useSession();

  const {
    page,
    search,
    filters = {},
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k].toString(),
      };
    }, {});

  const parsedSort = useMemo(() => {
    if (!sort) {
      return '';
    }

    const direction = sort.direction === 'asc' ? '-' : '';
    return `${direction}${sort.id}`;
  }, [sort]);

  const fetchPublishedProjects = () => ADMIN.request({
    method: 'GET',
    url: '/projects/published-projects/by-admin',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': page,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...parsedSort && {
        sort: parsedSort,
      },
    },
  }).then((response) => response.data);

  // TEST
  // const fetchPublishedProjects = () => TEST.request({
  //   method: 'GET',
  //   url: '/',
  //   headers: {
  //     Authorization: `Bearer ${session.accessToken}`,
  //   },
  //   params: {
  //     _page: page,
  //     _limit: 10,
  //     ...sort && {
  //       _sort: sort.column,
  //       _order: sort.direction,
  //     },
  //   },
  // }).then((response) => response.data);

  const query = useQuery(['admin-published-projects', JSON.stringify(options), page], fetchPublishedProjects, {
    retry: false,
    keepPreviousData: true,
    placeholderData: {
      data: [],
      meta: {} as any,
    },
    // TEST
    // placeholderData: [],
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      // data: data.map((d) => {
      //   return {
      //     title: d.title,
      //     area: 'custom',
      //     status: 'published',
      //     owner: {
      //       name: 'Miguel Barrenechea',
      //       email: 'barrenechea.miguel@gmail.com',
      //     },
      //   };
      // }),
      // meta: {
      //   page: 1,
      //   totalPages: 20,
      //   size: 5,
      //   totalItems: 100,
      // },
      data: data?.data.map((d) => {
        const owners = d.creators ? d.creators.filter((c) => c.roleName === 'project_owner') : [];

        return {
          id: d.id,
          name: d.name,
          description: d.description,
          status: d.underModeration ? 'under-moderation' : 'published',
          owners,
        };
      }),
      meta: data?.meta,
    };
  }, [query, data]);
}

export function useSaveAdminPublishedProject({
  requestConfig = {
    method: 'PATCH',
  },
}: UseSaveAdminPublishedProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveAdminPublishedProject = ({ id, data, status }: SaveAdminPublishedProjectProps) => {
    const action = status === 'published' ? 'clear' : 'set';

    return ADMIN.request({
      url: `/projects/${id}/moderation-status/${action}`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveAdminPublishedProject, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('admin-published-projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
