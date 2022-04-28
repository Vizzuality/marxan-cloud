import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';

import { format } from 'date-fns';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import {
  useProject, useExportProject, useExports, useDownloadExport,
} from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DownloadProjectModalProps {
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = () => {
  const { query } = useRouter();
  const { addToast } = useToasts();
  const { pid } = query;
  const plausible = usePlausible();

  const { data: projectData } = useProject(pid);
  const { user } = useMe();

  const {
    data: scenariosData,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const {
    data: exportsData,
  } = useExports(pid);

  const exportProjectMutation = useExportProject({});
  const downloadExportMutation = useDownloadExport({});

  const scenarioIds = useMemo(() => {
    return scenariosData?.map((scenario) => scenario.id);
  }, [scenariosData]);

  const onExportProject = useCallback(() => {
    exportProjectMutation.mutate({ id: `${pid}`, data: { scenarioIds } }, {

      onSuccess: () => {

      },
      onError: ({ e }) => {
        console.error('error --->', e);
        addToast('error-download-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Unable to download project
              {' '}
              {projectData?.name}
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
    plausible('Download project', {
      props: {
        userId: `${user.id}`,
        userEmail: `${user.email}`,
        projectId: `${pid}`,
        projectName: `${projectData.name}`,
      },
    });
  }, [
    pid,
    exportProjectMutation,
    scenarioIds,
    addToast,
    projectData?.name,
    plausible,
    user.email,
    user.id,
  ]);

  const onDownloadExport = useCallback((exportId) => {
    downloadExportMutation.mutate({ pid: `${pid}`, exportId }, {
      onSuccess: () => {

      },
      onError: ({ e }) => {
        console.error('error --->', e);
        addToast('error-download-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Unable to download project
              {' '}
              {projectData?.name}
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });

    plausible('Download project', {
      props: {
        exportId: `${exportId}`,
        userId: `${user.id}`,
        userEmail: `${user.email}`,
        projectId: `${pid}`,
        projectName: `${projectData.name}`,
      },
    });
  }, [pid, downloadExportMutation, projectData?.name, user.email, user.id, plausible, addToast]);

  return (
    <div className="px-6">
      <h1 className="mb-5 text-xl font-medium text-black">
        Download project
      </h1>

      <ul>
        {exportsData.map((e) => {
          return (
            <li
              key={e.exportId}
              className="flex items-center justify-between py-2 border-t border-gray-100"
            >
              <span className="text-sm text-gray-700">
                {format(new Date(e.createdAt), 'MM/dd/yyyy hh:mm a')}
              </span>

              <Button
                theme="primary"
                size="xs"
                className="space-x-2"
                onClick={() => {
                  onDownloadExport(e.exportId);
                }}
              >
                <span>Download</span>
                <Icon icon={DOWNLOAD_SVG} className="w-3 h-3" />
              </Button>
            </li>
          );
        })}
      </ul>

      <Button
        theme="secondary"
        size="base"
        className="w-full mt-5"
        onClick={onExportProject}
      >
        Generate new export
      </Button>
    </div>
  );
};

export default DownloadProjectModal;
