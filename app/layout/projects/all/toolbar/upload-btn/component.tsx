import React, { useState } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

import UploadModal from './upload-modal';

export interface ProjectsUploadBtnProps {

}

export const ProjectsUploadBtn: React.FC<ProjectsUploadBtnProps> = () => {
  const [modal, setModal] = useState(false);

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
        onDismiss={() => setModal(false)}
      >
        <UploadModal
          onDismiss={() => setModal(false)}
        />
      </Modal>
    </>

  );
};

export default ProjectsUploadBtn;
