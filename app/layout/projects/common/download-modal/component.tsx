import React, { useCallback, useEffect, useMemo } from 'react';

import { useQueryClient } from 'react-query';

import { format } from 'date-fns';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useProject, useExportProject, useExports, useDownloadExport } from 'hooks/projects';
import { useScenarios, useScenariosStatus } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DownloadProjectModalProps {
  pid: string;
  name: string;
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = ({
  pid,
  name,
}: DownloadProjectModalProps) => {
  const queryClient = useQueryClient();

  const { addToast } = useToasts();
  const plausible = usePlausible();

  const { data: projectData } = useProject(pid);
  const { data: user } = useMe();

  const { data: scenariosData } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const { data: exportsData, isFetching: exportsIsFetching } = useExports(pid);

  // JOBS
  const { data: scenarioStatusData } = useScenariosStatus(pid);
  const { jobs = [], scenarios = [] } = scenarioStatusData || {};
  const JOBS = useMemo(() => {
    return [...jobs, ...scenarios.map((scenario) => scenario.jobs || []).flat()];
  }, [jobs, scenarios]);
  const JOBS_RUNNING = JOBS.some(({ status }) => status === 'running');
  const EXPORT_JOBS_RUNNING = JOBS.filter((j) => j.kind === 'export').some(
    ({ status }) => status === 'running'
  );

  // MUTATIONS
  const exportProjectMutation = useExportProject({});
  const downloadExportMutation = useDownloadExport({});

  const scenarioIds = useMemo(() => {
    return scenariosData?.map((scenario) => scenario.id);
  }, [scenariosData]);

  useEffect(() => {
    if (!EXPORT_JOBS_RUNNING) {
      queryClient.invalidateQueries(['projects-exports', pid]);
    }
  }, [EXPORT_JOBS_RUNNING]); // eslint-disable-line react-hooks/exhaustive-deps

  const onExportProject = useCallback(() => {
    exportProjectMutation.mutate(
      { id: `${pid}`, data: { scenarioIds } },
      {
        onSuccess: () => {
          addToast(
            'success-download-project',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">{`Exporting project "${projectData?.name}" started`}</p>
            </>,
            {
              level: 'success',
            }
          );
        },
        onError: ({ e }) => {
          console.error('error --->', e);
          addToast(
            'error-download-project',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Unable to export project {projectData?.name}</p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
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

  const onDownloadExport = useCallback(
    (exportId) => {
      downloadExportMutation.mutate(
        { pid: `${pid}`, exportId },
        {
          onSuccess: () => {
            addToast(
              'success-download-project',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Project {projectData?.name} has been downloaded</p>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: ({ e }) => {
            console.error('error --->', e);
            addToast(
              'error-download-project',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Unable to download project {projectData?.name}</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );

      plausible('Download project', {
        props: {
          exportId: `${exportId}`,
          userId: `${user.id}`,
          userEmail: `${user.email}`,
          projectId: `${pid}`,
          projectName: `${projectData.name}`,
        },
      });
    },
    [pid, downloadExportMutation, projectData?.name, user.email, user.id, plausible, addToast]
  );

  return (
    <div className="relative px-6">
      <Loading
        className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-white bg-opacity-50"
        iconClassName="w-10 h-10"
        visible={exportsIsFetching || EXPORT_JOBS_RUNNING}
      />

      <h1 className="mb-5 text-xl font-medium text-black">{`Download "${name}"`}</h1>

      <div className="mb-5 space-y-1 text-sm text-gray-600">
        <p>The last 5 exported .zips will be available for download.</p>
        <p>
          {`
            If you don't have any exported .zips,
            you can export your project by clicking the button below "Generate new export".
          `}
        </p>
      </div>

      <div>
        <ul>
          {exportsData.map((e) => {
            return (
              <li
                key={e.exportId}
                className="flex items-center justify-between border-t border-gray-200 py-2"
              >
                <span className="text-sm text-gray-800">
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
                  <Icon icon={DOWNLOAD_SVG} className="h-3 w-3" />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 space-y-1">
        {JOBS_RUNNING && (
          <p className="text-center text-xs text-red-500">
            {`You can't generate a new export
              while there are running jobs.`}
          </p>
        )}
        <Button
          theme="secondary"
          size="base"
          className="w-full"
          disabled={JOBS_RUNNING}
          onClick={onExportProject}
        >
          Generate new export
        </Button>
      </div>
    </div>
  );
};

export default DownloadProjectModal;
