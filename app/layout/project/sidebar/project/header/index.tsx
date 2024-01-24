import { ComponentProps, useCallback } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useProject, useSaveProject } from 'hooks/projects';

import Title from 'layout/project/sidebar/header/title';
import Contributors from 'layout/project/sidebar/project/header/contributors';
import ProjectButton from 'layout/project/sidebar/project/header/project-button';
import UnderModeration from 'layout/project/sidebar/project/header/under-moderation';

const InventoryProjectHeader = (): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const queryClient = useQueryClient();

  const projectQuery = useProject(pid);
  const { name, description } = projectQuery.data;

  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const onEditProjectName = useCallback(
    (newName: Parameters<ComponentProps<typeof Title>['onEditTitle']>[0]) => {
      saveProjectMutation.mutate(
        {
          id: pid,
          data: {
            name: newName,
          },
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(['project', pid]);
          },
        }
      );
    },
    [saveProjectMutation, queryClient, pid]
  );

  return (
    <div className="flex items-start justify-between">
      <UnderModeration />
      <Title title={name} description={description} onEditTitle={onEditProjectName} />
      <div className="mt-4 flex items-center space-x-5">
        <Contributors />
        <ProjectButton />
      </div>
    </div>
  );
};

export default InventoryProjectHeader;
