import { useState } from 'react';

import { useSelector } from 'react-redux';

import Button from 'components/button';
import Modal from 'components/modal/component';

import DeleteModal from '../modals/delete';

const FeaturesBulkActionMenu = (): JSX.Element => {
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { selectedFeatures } = useSelector((state) => state['/projects/[id]']);

  return (
    <div className="absolute bottom-0 left-0 z-10 flex w-full items-center space-x-4 bg-black px-10 py-4">
      <Button theme="secondary-alt" size="lg">
        Edit
      </Button>
      <Button theme="secondary" size="lg" onClick={() => setDeleteModal(true)}>
        Delete
      </Button>
      <Modal
        id="delete-features-modal"
        dismissable
        open={deleteModal}
        size="narrow"
        onDismiss={() => setDeleteModal(false)}
      >
        <DeleteModal selectedFeatures={selectedFeatures} setDeleteModal={setDeleteModal} />
      </Modal>
    </div>
  );
};

export default FeaturesBulkActionMenu;
