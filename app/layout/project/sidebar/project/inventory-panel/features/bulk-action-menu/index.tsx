import { useState } from 'react';

import Button from 'components/button';
import Modal from 'components/modal/component';
import { ProjectFeature } from 'types/project-model';

import DeleteModal from '../modals/delete';

const FeaturesBulkActionMenu = ({
  selectedFeatureIds,
}: {
  selectedFeatureIds: ProjectFeature['id'][];
}): JSX.Element => {
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  return (
    <div className="absolute bottom-0 left-0 z-10 flex w-full items-center space-x-4 bg-black px-10 py-4">
      <Button theme="secondary-alt" size="lg">
        Edit
      </Button>
      <Button theme="secondary" size="lg" onClick={() => setDeleteModal(true)}>
        Delete
      </Button>
      <Modal
        id="delete-modal"
        dismissable
        open={deleteModal}
        size="narrow"
        title="Delete feature"
        onDismiss={() => setDeleteModal(false)}
      >
        <DeleteModal selectedFeatures={selectedFeatureIds} setDeleteModal={setDeleteModal} />
      </Modal>
    </div>
  );
};

export default FeaturesBulkActionMenu;
