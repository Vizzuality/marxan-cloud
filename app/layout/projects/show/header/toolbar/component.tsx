import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useProjectRole } from 'hooks/project-users';
import { useProject, usePublishProject } from 'hooks/projects';
import { usePublishedProjects } from 'hooks/published-projects';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import ComingSoon from 'layout/help/coming-soon';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Icon from 'components/icon';
import Modal from 'components/modal';

import COMMUNITY_SVG from 'svgs/project/community.svg?sprite';
import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

export interface ToolbarProps {
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const [modal, setModal] = useState(false);

  const { query } = useRouter();
  const { pid } = query;
  const plausible = usePlausible();
  const { addToast } = useToasts();

  const { data: projectData } = useProject(pid);
  const { user } = useMe();

  const { data: projectRole } = useProjectRole(pid);
  const OWNER = projectRole === 'project_owner';

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

  return (
    <>
      <AnimatePresence>
        {projectData?.name && (
          <motion.div
            key="project-toolbar"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            <div className="flex space-x-4">
              <Button
                className="text-white"
                theme="primary-alt"
                size="base"
                onClick={() => setModal(true)}
              >
                <span className="mr-2.5">Publish to Community</span>
                <Icon icon={COMMUNITY_SVG} />
              </Button>
              <HelpBeacon
                id="scenarios-upload"
                title="Upload scenario"
                subtitle=""
                content={(
                  <div>
                    You can upload the files of a marxan scenario directly.
                    You will need to compress your input files
                    as a zipfile. Make sure that your planning region and grid match the one used
                    for all the scenarios is this project.
                  </div>
                )}
              >
                <div>
                  <ComingSoon>
                    <Button
                      theme="secondary"
                      size="base"
                    >
                      <span className="mr-2.5">Upload new Scenario</span>
                      <Icon icon={UPLOAD_SVG} />
                    </Button>
                  </ComingSoon>
                </div>
              </HelpBeacon>

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
                  <ComingSoon>
                    <Button
                      theme="secondary"
                      size="base"
                      onClick={() => plausible('Download project', {
                        props: {
                          userId: `${user.id}`,
                          userEmail: `${user.email}`,
                          projectId: `${pid}`,
                          projectName: `${projectData.name}`,
                        },
                      })}
                    >
                      <span className="mr-2.5">Download project</span>
                      <Icon icon={DOWNLOAD_SVG} />
                    </Button>
                  </ComingSoon>
                </div>
              </HelpBeacon>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        dismissable
        open={modal}
        className="p-6"
        size="default"
        title="Publisj to community"
        onDismiss={() => setModal(false)}
      >
        <FormRFF
          onSubmit={onPublish}
          initialValues={{
            name: projectData?.name || '',
          }}
        >
          {({ form, handleSubmit }) => (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="flex flex-col justify-between flex-grow w-full overflow-hidden"
            >
              <h1 className="mb-5 text-xl font-medium text-black">
                Publish project to the community
              </h1>

              {/* NAME */}
              <div className="mt-8">
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

              <div className="flex justify-between mx-auto space-x-4">
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

export default Toolbar;
