import React, { useState } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

import DownloadProjectModal from './download-modal';

export interface DownloadProjectButtonProps {
}

export const DownloadProjectButton: React.FC<DownloadProjectButtonProps> = () => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button
        className="text-white"
        theme="primary-alt"
        size="base"
        onClick={() => setModal(true)}
      >
        <span className="mr-2.5">Download project</span>
        <Icon icon={DOWNLOAD_SVG} />
      </Button>

      <Modal
        id="download-project-modal"
        dismissable
        open={modal}
        size="narrow"
        title="Download project"
        onDismiss={() => setModal(false)}
      >
        <DownloadProjectModal />
      </Modal>
    </>
  );
};

export default DownloadProjectButton;
