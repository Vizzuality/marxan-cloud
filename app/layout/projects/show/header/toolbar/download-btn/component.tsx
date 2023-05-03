import React, { useState } from 'react';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';
import DownloadProjectModal from 'layout/projects/common/download-modal';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DownloadProjectButtonProps {}

export const DownloadProjectButton: React.FC<DownloadProjectButtonProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { data: projectData } = useProject(pid);

  const [modal, setModal] = useState(false);

  return (
    <>
      <Button className="text-white" theme="secondary" size="base" onClick={() => setModal(true)}>
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
        <DownloadProjectModal pid={`${pid}`} name={projectData?.name} />
      </Modal>
    </>
  );
};

export default DownloadProjectButton;
