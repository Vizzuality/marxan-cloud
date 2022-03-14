import React, { useCallback, useState } from 'react';

import { Form as FormRFF/* , Field as FieldRFF */ } from 'react-final-form';

import { useRouter } from 'next/router';

import { useCanEditProject/* , useProjectUsers */ } from 'hooks/project-users';
import { useProject, usePublishProject } from 'hooks/projects';
import { usePublishedProjects } from 'hooks/published-projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
// import Field from 'components/forms/field';
// import Input from 'components/forms/input';
// import Label from 'components/forms/label';
// import Textarea from 'components/forms/textarea';
import Icon from 'components/icon';
import Modal from 'components/modal';

import COMMUNITY_SVG from 'svgs/project/community.svg?sprite';

export interface PublishProjectButtonProps {
}

export const PublishProjectButton: React.FC<PublishProjectButtonProps> = () => {
  const [modal, setModal] = useState(false);

  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const { data: projectData } = useProject(pid);

  const { data: projectRole } = useCanEditProject(pid);
  const OWNER = projectRole === 'project_owner';

  // const {
  //   data: projectUsers,
  // } = useProjectUsers(pid);

  const { data: publishedProjectsData } = usePublishedProjects({});

  const publishProjectMutation = usePublishProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const onPublish = useCallback(() => {
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

  const isPublic = !!publishedProjectsData?.find((p) => p?.id === projectData?.id);

  // const contributors = projectUsers.map((u) => u.user);

  return (
    <>
      <Button
        className="text-white"
        theme="primary-alt"
        size="base"
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
          onSubmit={onPublish}
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

              <div className="mt-8">
                <FieldRFF
                  name="contributors"
                >
                  {(fprops) => (
                    <Field id="contributors" {...fprops}>
                      <div className="flex items-center mb-3 space-x-2">
                        <Label theme="light" className="uppercase" id="name">
                          Contributors
                        </Label>
                      </div>

                      <div className="mb-4">
                        {contributors.map((c) => (
                          <p key={c.id} className="text-sm leading-6 text-black">{c.displayName}</p>
                        ))}
                      </div>

                      <Input
                        theme="light"
                        type="text"
                        className="text-sm"
                        placeholder="Add up to 10 aditional creators."
                      />
                    </Field>
                  )}
                </FieldRFF>
              </div> */}

              <div className="flex justify-between mx-auto mt-4 space-x-4">
                <Button
                  theme="secondary"
                  size="base"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isPublic || !OWNER}
                  theme="primary"
                  size="base"
                  type="submit"
                  onClick={onPublish}
                >
                  Publish
                </Button>
              </div>
            </form>
          )}
        </FormRFF>
      </Modal>
    </>
  );
};

export default PublishProjectButton;
