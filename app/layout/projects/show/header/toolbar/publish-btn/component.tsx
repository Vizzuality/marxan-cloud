import React, { useCallback, useState } from 'react';

import { Form as FormRFF/* , Field as FieldRFF */ } from 'react-final-form';

import { useRouter } from 'next/router';

import { useOwnsProject } from 'hooks/permissions';
import { useProject, usePublishProject, useUnPublishProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
// import Field from 'components/forms/field';
// import Input from 'components/forms/input';
// import Label from 'components/forms/label';
// import Textarea from 'components/forms/textarea';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import Modal from 'components/modal';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import COMMUNITY_SVG from 'svgs/project/community.svg?sprite';

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

  // const {
  //   data: projectUsers,
  // } = useProjectUsers(pid);

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
            <span className="mr-2.5">Publish to Community</span>
            <Icon icon={COMMUNITY_SVG} />
          </Button>

          <Modal
            dismissable
            open={modal}
            size="default"
            title="Publish to community"
            onDismiss={() => setModal(false)}
          >
            <FormRFF
              onSubmit={handlePublish}
              initialValues={{
                name: projectData?.name || '',
                description: projectData?.description || '',
              }}
            >
              {({ form, handleSubmit }) => (
                <form
                  onSubmit={handleSubmit}
                  autoComplete="off"
                  className="flex flex-col justify-between flex-grow w-full px-6 overflow-hidden"
                >
                  <h1 className="mb-5 text-xl font-medium text-black">
                    Publish project to the community
                  </h1>

                  {/* <div className="mt-8">
                    <FieldRFF
                      name="name"
                    >
                      {(fprops) => (
                        <Field id="name" {...fprops}>
                          <div className="flex items-center mb-3 space-x-2">
                            <Label theme="light" className="uppercase" id="name">
                              Project Name
                            </Label>
                          </div>
                          <Input theme="light" type="text" placeholder="Write project name..." />
                        </Field>
                      )}
                    </FieldRFF>
                  </div>

                  <div className="mt-8">
                    <FieldRFF
                      name="description"
                    >
                      {(fprops) => (
                        <Field id="description" {...fprops}>
                          <Label theme="light" className="mb-3 uppercase">Description</Label>
                          <Textarea
                            className="text-sm"
                            theme="light"
                            rows={4}
                            placeholder="Write your project description..."
                          />
                        </Field>
                      )}
                    </FieldRFF>
                  </div>
                  */}

                  <div className="flex justify-between mx-auto mt-4 space-x-4">
                    <Button
                      theme="secondary"
                      size="base"
                      onClick={() => setModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isPublic || !isOwner}
                      theme="primary"
                      size="base"
                      type="submit"
                    >
                      Publish
                    </Button>
                  </div>
                </form>
              )}
            </FormRFF>
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
            <span className="mr-2.5">Unpublish from Community</span>
            <Icon icon={COMMUNITY_SVG} />
          </Button>

          <ConfirmationPrompt
            title={`Are you sure you want unpublish "${projectData?.name}"?`}
            // description="The action can be reverted."
            icon={DELETE_WARNING_SVG}
            iconClassName="w-16 h-16"
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
