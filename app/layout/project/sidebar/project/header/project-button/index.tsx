import { useState } from 'react';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';

import Icon from 'components/icon/component';
import Modal from 'components/modal';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import DownloadProjectModal from 'layout/projects/common/download-modal';
import { cn } from 'utils/cn';

import DOTS_SVG from 'svgs/ui/dots.svg?sprite';

const ProjectButton = (): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: projectData } = useProject(pid);
  const [downloadModal, setDownloadModal] = useState<boolean>(false);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 hover:border-white">
            <Icon
              icon={DOTS_SVG}
              className={cn({
                'h-4 w-4 text-white': true,
              })}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          sideOffset={20}
          className="w-32 rounded-2xl !border-none bg-gray-700 !p-0 font-sans text-xs"
          collisionPadding={48}
        >
          <button
            className="group flex w-full cursor-pointer items-center space-x-3 rounded-t-2xl px-2.5 py-2 hover:bg-gray-500"
            // disabled={!editable}
            onClick={() => console.log('publish project')}
          >
            {/* <Icon
            className="h-5 w-5 text-gray-500 transition-colors group-hover:text-white"
            icon={DUPLICATE_SVG}
          /> */}
            <p>Publish/Unpublish</p>
          </button>
          <button
            className="group flex w-full cursor-pointer items-center space-x-3 rounded-b-2xl px-2.5 py-2 hover:bg-gray-500"
            // disabled={!editable}
            onClick={() => setDownloadModal(true)}
          >
            {/* <Icon
            className="h-5 w-5 text-gray-500 transition-colors group-hover:text-white"
            icon={DELETE_SVG}
          /> */}
            <p>Download</p>
          </button>
        </PopoverContent>
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
