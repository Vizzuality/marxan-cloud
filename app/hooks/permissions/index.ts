import { useMemo } from 'react';

import { useMe } from 'hooks/me';
import { useProjectUsers } from 'hooks/project-users';
import { useScenarioLockMe } from 'hooks/scenarios';

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
    return isOwner;
  }, [isOwner]);
}

export function useCanEditProject(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const editorRoles = ['project_owner', 'project_contributor'];

  const roleMe = projectUsers?.find((r) => r.user.id === meId)?.roleName;

  const editable = editorRoles.includes(roleMe);

  return useMemo(() => {
    return editable;
  }, [editable]);
}

export function useOwnsScenario(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const isOwner = projectUsers?.find((r) => r.user.id === meId)?.roleName === 'project_owner';

  return useMemo(() => {
    return isOwner;
  }, [isOwner]);
}

export function useCanEditScenario(projectId, scenarioId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);
  const isLockMe = useScenarioLockMe(scenarioId);

  const meId = me?.data?.id;

  const editorRoles = ['project_owner', 'project_contributor'];

  const roleMe = projectUsers?.find((r) => r.user.id === meId)?.roleName;

  const editable = editorRoles.includes(roleMe) && isLockMe;

  return useMemo(() => {
    return editable;
  }, [editable]);
}
