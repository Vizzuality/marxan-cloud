import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
// import { usePlausible } from 'next-plausible';

// import { useMe } from 'hooks/me';
import {
  useProject, useSaveProjectDownload, useExportId, useDownloadProject,
} from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import PublishProjectButton from 'layout/projects/show/header/toolbar/publish-btn';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface ToolbarProps {
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const { query } = useRouter();
  const { addToast } = useToasts();
  const { pid } = query;
  // const plausible = usePlausible();

  const { data: projectData } = useProject(pid);
  const { data: exportId } = useExportId(pid);
  // const { user } = useMe();

  const {
    data: scenariosData,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const projectDownloadMutation = useSaveProjectDownload({});
  const downloadProject = useDownloadProject({});

  const scenarioIds = useMemo(() => {
    return scenariosData?.map((scenario) => scenario.id);
  }, [scenariosData]);

  const onDownloadProject = useCallback(() => {
    projectDownloadMutation.mutate({ id: `${pid}`, data: { scenarioIds } }, {

      onSuccess: () => {
        downloadProject.mutate({
          id: `${pid}`,
          exportId: `${exportId}`,
        }, {
          onSuccess: () => {

          },
          onError: () => {
            addToast('download-error', (
              <>
                <h2 className="font-medium">Error!</h2>
                <ul className="text-sm">
                  `Project $
                  {projectData?.name}
                  {' '}
                  not downloaded. Try again.`
                </ul>
              </>
            ), {
              level: 'error',
            });
          },
        });
      },
      onError: ({ e }) => {
        console.error('error --->', e);
        addToast('error-project-name', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              `Unable to download project
              {' '}
              $
              {projectData?.name}
              `
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
    // plausible('Download project', {
    //   props: {
    //     userId: `${user.id}`,
    //     userEmail: `${user.email}`,
    //     projectId: `${pid}`,
    //     projectName: `${projectData.name}`,
    //   },
    // });
  }, [
    pid,
    projectDownloadMutation,
    scenarioIds,
    addToast,
    projectData?.name,
    exportId,
    downloadProject,
  ]);

  return (
    <AnimatePresence>
      {projectData?.name && (
        <motion.div
          key="project-toolbar"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <div className="flex space-x-4">
            <PublishProjectButton />

            <HelpBeacon
              id="project-download"
              title="Download scenario"
              subtitle=""
              content={(
                <div>
                  You can download all the files from your project in the standard Marxan
                  format. This will allow you to edit your project outside of the Marxan
                  Cloud platform.
                  After doing so you can continue working inside Marxan Cloud by
                  re-uploading your files back into the platform.

                </div>
              )}
            >
              <div>

                <Button
                  theme="secondary"
                  size="base"
                  onClick={onDownloadProject}
                >
                  <span className="mr-2.5">Download project</span>
                  <Icon icon={DOWNLOAD_SVG} />
                </Button>

              </div>
            </HelpBeacon>

          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
};

export default Toolbar;
