import { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import omit from 'lodash/omit';

import { useOwnsProject } from 'hooks/permissions';
import { useProject, usePublishProject, useUnPublishProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon/component';
import Modal from 'components/modal';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import Tooltip from 'components/tooltip';
import DownloadProjectModal from 'layout/projects/common/download-modal';
import { cn } from 'utils/cn';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import DOTS_SVG from 'svgs/ui/dots.svg?sprite';

import PublishModal from './publish-modal';

const ProjectButton = (): JSX.Element => {
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const isOwner = useOwnsProject(pid);

  const { data: projectData } = useProject(pid);
  const { isPublic } = projectData;

  const [content, setContent] = useState<boolean>(false);

  const [downloadModal, setDownloadModal] = useState<boolean>(false);
  const [publishModal, setPublishModal] = useState<boolean>(false);

  const [publishing, setPublishing] = useState<boolean>(false);
  const [confirmUnPublish, setConfirmUnPublish] = useState<Record<string, any>>();

  const publishProjectMutation = usePublishProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const unpublishProjectMutation = useUnPublishProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const { data: rawScenariosData } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const SCENARIOS_RUNNED = useMemo(() => {
    return rawScenariosData.some((s) => {
      return s.ranAtLeastOnce;
    });
  }, [rawScenariosData]);

  const handlePublish = useCallback(
    (values) => {
      setPublishing(true);
      const data = omit(values, 'scenarioId'); // TODO: Remove this when the API supports it

      publishProjectMutation.mutate(
        // @ts-ignore
        { pid: `${pid}`, data },
        {
          onSuccess: () => {
            setPublishing(false);
            setPublishModal(false);
            addToast(
              'success-publish-project',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">You have published the project in the community.</p>
              </>,
              {
                level: 'success',
              }
            );
            setContent(false);
          },
          onError: () => {
            setPublishing(false);
            addToast(
              'error-publish-project',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">
                  It has not been possible to publish the project in the community.
                </p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [pid, publishProjectMutation, addToast]
  );

  const handleUnpublish = useCallback(() => {
    unpublishProjectMutation.mutate(
      {
        id: confirmUnPublish?.id,
      },
      {
        onSuccess: () => {
          setConfirmUnPublish(null);
          confirmUnPublish && setContent(false);
        },
        onError: () => {
          addToast(
            'delete-admin-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">
                Oops! Something went wrong.
                <br />
                Please, try again!
              </p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [unpublishProjectMutation, confirmUnPublish, addToast]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 hover:border-white"
            onClick={() => setContent(true)}
          >
            <Icon
              icon={DOTS_SVG}
              className={cn({
                'h-4 w-4 text-white': true,
              })}
            />
          </button>
        </PopoverTrigger>
        {content && (
          <PopoverContent
            side="left"
            sideOffset={20}
            className="!z-40 w-32 rounded-2xl !border-none bg-gray-700 !p-0 font-sans text-xs"
            collisionPadding={48}
            onInteractOutside={() => setContent(false)}
          >
            {!isPublic && (
              <>
                <Tooltip
                  disabled={isOwner && SCENARIOS_RUNNED}
                  arrow
                  placement="top"
                  content={
                    <div
                      className="rounded bg-white p-4 text-xs text-gray-500"
                      style={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        maxWidth: 200,
                      }}
                    >
                      You need to be the owner and have at least one scenario runned to publish the
                      project.
                    </div>
                  }
                >
                  <button
                    className="group flex w-full cursor-pointer items-center space-x-3 rounded-t-2xl px-2.5 py-2 hover:bg-gray-500"
                    disabled={!isOwner || !SCENARIOS_RUNNED}
                    onClick={() => setPublishModal(true)}
                  >
                    <p>Publish</p>
                  </button>
                </Tooltip>
                <Modal
                  id="publish-project-modal"
                  dismissable
                  open={publishModal}
                  size="narrow"
                  title="Publish to community"
                  onDismiss={() => setPublishModal(false)}
                >
                  <PublishModal
                    publishing={publishing}
                    onSubmit={handlePublish}
                    onCancel={() => setPublishModal(false)}
                  />
                </Modal>
              </>
            )}
            {isPublic && (
              <>
                <button
                  className="group flex w-full cursor-pointer items-center space-x-3 rounded-t-2xl px-2.5 py-2 hover:bg-gray-500"
                  disabled={!isOwner}
                  onClick={() => setConfirmUnPublish(projectData)}
                >
                  <p>Unpublish</p>
                </button>
                <ConfirmationPrompt
                  title={`Are you sure you want unpublish "${projectData?.name}"?`}
                  icon={DELETE_WARNING_SVG}
                  open={!!confirmUnPublish}
                  onAccept={handleUnpublish}
                  onRefuse={() => setConfirmUnPublish(null)}
                  onDismiss={() => setConfirmUnPublish(null)}
                />
              </>
            )}

            <button
              className="group flex w-full cursor-pointer items-center space-x-3 rounded-b-2xl px-2.5 py-2 hover:bg-gray-500"
              onClick={() => setDownloadModal(true)}
            >
              <p>Download</p>
            </button>
          </PopoverContent>
        )}
      </Popover>
      <Modal
        id="download-project-modal"
        dismissable
        open={downloadModal}
        size="narrow"
        title="Download project"
        onDismiss={() => setDownloadModal(false)}
      >
        <DownloadProjectModal pid={`${pid}`} name={projectData?.name} />
      </Modal>
    </>
  );
};

export default ProjectButton;