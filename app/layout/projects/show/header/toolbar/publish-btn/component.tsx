import React, { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { useOwnsProject } from 'hooks/permissions';
import { useProject, usePublishProject, useUnPublishProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import Modal from 'components/modal';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import COMMUNITY_SVG from 'svgs/project/community.svg?sprite';

import PublishModal from './publish-modal';

export interface PublishProjectButtonProps {
}

export const PublishProjectButton: React.FC<PublishProjectButtonProps> = () => {
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

  const handlePublish = useCallback(() => {
    publishProjectMutation.mutate({ id: `${pid}` }, {
      onSuccess: () => {
        addToast('success-publish-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">You have published the project in the community.</p>
          </>
        ), {
          level: 'success',
        });

        setModal(false);
      },
      onError: () => {
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
          <Button
            className="text-white"
            theme="primary-alt"
            size="base"
            disabled={!isOwner}
            onClick={() => setModal(true)}
          >
            <span className="mr-2.5">Publish project</span>
            <Icon icon={COMMUNITY_SVG} />
          </Button>

          <Modal
            dismissable
            open={modal}
            size="narrow"
            title="Publish to community"
            onDismiss={() => setModal(false)}
          >
            <PublishModal
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
