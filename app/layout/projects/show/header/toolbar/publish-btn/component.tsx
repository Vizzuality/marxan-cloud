import React, { useCallback, useMemo, useState } from 'react';

import omit from 'lodash/omit';

import { useRouter } from 'next/router';

import { useOwnsProject } from 'hooks/permissions';
import { useProject, usePublishProject, useUnPublishProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import Modal from 'components/modal';
import Tooltip from 'components/tooltip';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import COMMUNITY_SVG from 'svgs/project/community.svg?sprite';

import PublishModal from './publish-modal';

export interface PublishProjectButtonProps {
}

export const PublishProjectButton: React.FC<PublishProjectButtonProps> = () => {
  const [publishing, setPublishing] = useState(false);
  const [modal, setModal] = useState(false);
  const [confirmUnPublish, setConfirmUnPublish] = useState<Record<string, any>>();

  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const { data: projectData } = useProject(pid);
  const { isPublic } = projectData;

  const isOwner = useOwnsProject(pid);

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

  const {
    data: rawScenariosData,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const SCENARIOS_RUNNED = useMemo(() => {
    return rawScenariosData
      .some((s) => {
        return s.ranAtLeastOnce;
      });
  }, [rawScenariosData]);

  const handlePublish = useCallback((values) => {
    setPublishing(true);
    const data = omit(values, 'scenarioId'); // TODO: Remove this when the API supports it

    // @ts-ignore
    publishProjectMutation.mutate({ pid: `${pid}`, data }, {
      onSuccess: () => {
        setPublishing(false);
        setModal(false);
        addToast('success-publish-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">You have published the project in the community.</p>
          </>
        ), {
          level: 'success',
        });
      },
      onError: () => {
        setPublishing(false);
        addToast('error-publish-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">It has not been possible to publish the project in the community.</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, publishProjectMutation, addToast]);

  const handleUnpublish = useCallback(() => {
    unpublishProjectMutation.mutate({
      id: confirmUnPublish.id,
    }, {
      onSuccess: () => {
        setConfirmUnPublish(null);
      },
      onError: () => {
        addToast('delete-admin-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Oops! Something went wrong.
              <br />
              Please, try again!
            </p>
          </>
        ), {
          level: 'error',
        });
      },

    });
  }, [unpublishProjectMutation, confirmUnPublish, addToast]);

  return (
    <>
      {!isPublic && (
        <>
          <Tooltip
            disabled={(isOwner && SCENARIOS_RUNNED)}
            arrow
            placement="top"
            content={(
              <div
                className="p-4 text-xs text-gray-500 bg-white rounded"
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  maxWidth: 200,
                }}
              >
                You need to be the owner and have at
                least one scenario runned to publish the project.
              </div>
            )}
          >
            <div>
              <Button
                className="text-white"
                theme="primary-alt"
                size="base"
                disabled={!isOwner || !SCENARIOS_RUNNED}
                onClick={() => setModal(true)}
              >
                <span className="mr-2.5">Publish project</span>
                <Icon icon={COMMUNITY_SVG} />
              </Button>
            </div>
          </Tooltip>

          <Modal
            id="publish-project-modal"
            dismissable
            open={modal}
            size="narrow"
            title="Publish to community"
            onDismiss={() => setModal(false)}
          >
            <PublishModal
              publishing={publishing}
              onSubmit={handlePublish}
              onCancel={() => setModal(false)}
            />
          </Modal>
        </>
      )}

      {isPublic && (
        <>
          <Button
            className="text-white"
            theme="primary-alt"
            size="base"
            disabled={!isOwner}
            onClick={() => setConfirmUnPublish(projectData)}
          >
            <span className="mr-2.5">Unpublish project</span>
            <Icon icon={COMMUNITY_SVG} />
          </Button>

          <ConfirmationPrompt
            title={`Are you sure you want unpublish "${projectData?.name}"?`}
            // description="The action can be reverted."
            icon={DELETE_WARNING_SVG}
            // iconClassName="w-16 h-16"
            open={!!confirmUnPublish}
            onAccept={handleUnpublish}
            onRefuse={() => setConfirmUnPublish(null)}
            onDismiss={() => setConfirmUnPublish(null)}
          />

        </>
      )}
    </>
  );
};

export default PublishProjectButton;
