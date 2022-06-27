import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { setUploadMode, setLegacyProjectId } from 'store/slices/projects/new';

import { useCancelUploadLegacyProject } from 'hooks/projects';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

import LegacyUploadModal from './legacy-upload-modal';
import UploadModal from './upload-modal';

export interface ProjectsUploadBtnProps {

}

export const ProjectsUploadBtn: React.FC<ProjectsUploadBtnProps> = () => {
  const [modal, setModal] = useState(false);

  const dispatch = useDispatch();
  const { uploadMode, legacyProjectId } = useSelector((state) => state['/projects/new']);

  const cancelLegacyProjectMutation = useCancelUploadLegacyProject({});

  const onCancelUploadLegacyProject = useCallback(() => {
    cancelLegacyProjectMutation.mutate({ id: legacyProjectId }, {
      onSuccess: ({ data: { projectId } }) => {
        dispatch(setLegacyProjectId(null));
        console.info('Upload legacy project has been canceled', projectId);
      },
      onError: () => {
        console.error('Scenario not canceled');
      },
    });
  }, [dispatch, legacyProjectId, cancelLegacyProjectMutation]);

  const onDismiss = useCallback(() => {
    setModal(false);
    dispatch(setUploadMode('default'));
    if (legacyProjectId) onCancelUploadLegacyProject();
  }, [dispatch, legacyProjectId, onCancelUploadLegacyProject]);

  return (
    <>
      <Button
        theme="secondary"
        size="base"
        onClick={() => {
          setModal(true);
        }}
      >
        <span>Upload project</span>
        <Icon className="w-3 h-3 ml-4" icon={UPLOAD_SVG} />
      </Button>

      <Modal
        id="publish-project-modal"
        dismissable
        open={modal}
        size="narrow"
        title="Publish to community"
        onDismiss={onDismiss}
      >
        {uploadMode === 'default' && (
          <UploadModal
            onDismiss={onDismiss}
          />
        )}

        {uploadMode === 'legacy' && (
          <LegacyUploadModal onDismiss={onDismiss} />
        )}
      </Modal>
    </>

  );
};

export default ProjectsUploadBtn;
