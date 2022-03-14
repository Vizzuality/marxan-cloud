import { useMemo } from 'react';

import { useMe } from 'hooks/me';
import { useProjectUsers } from 'hooks/project-users';

export function useProjectRole(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const projectRole = projectUsers?.find((r) => r.user.id === meId)?.roleName;

  return useMemo(() => {
    return {
      data: projectRole,
    };
  }, [projectRole]);
}

export function useOwnsProject(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const isOwner = projectUsers?.find((r) => r.user.id === meId)?.roleName === 'project_owner';

  return useMemo(() => {
    return {
      data: isOwner,
    };
  }, [isOwner]);
}

export function useCanEditProject(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const canEdit = projectUsers?.find((r) => r.user.id === meId)?.roleName === ('project_owner' || 'project_contributor');

  return useMemo(() => {
    return {
      data: canEdit,
    };
  }, [canEdit]);
}

export function useOwnsScenario(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const isOwner = projectUsers?.find((r) => r.user.id === meId)?.roleName === 'project_owner';

  return useMemo(() => {
    return {
      data: isOwner,
    };
  }, [isOwner]);
}

export function useCanEditScenario(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const canEdit = projectUsers?.find((r) => r.user.id === meId)?.roleName !== ('project_viewer');

  return useMemo(() => {
    return {
      data: canEdit,
    };
  }, [canEdit]);
}
