import { useMemo } from 'react';

import { useMe } from 'hooks/me';
import { useProjectUsers } from 'hooks/project-users';

export function useCanEditProject(projectId) {
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
