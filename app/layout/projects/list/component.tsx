import React, { useState } from 'react';
import cx from 'classnames';

import { useSelector } from 'react-redux';

import Wrapper from 'layout/wrapper';

import Loading from 'components/loading';
import Item from 'components/projects/item';
import Modal from 'components/modal';
import Button from 'components/button';
import Icon from 'components/icon';

import { useProjects, useDeleteProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import DELETE_PROJECT from 'svgs/projects/delete-project.svg?sprite';

import { ProjectsListProps } from './types';

export const ProjectsList: React.FC<ProjectsListProps> = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToBeDeleted, setProjectToBeDeleted] = useState<string>(null);

  const { search } = useSelector((state) => state['/projects']);
  const { addToast } = useToasts();

  const {
    data, isFetching, isFetched,
  } = useProjects({ search });

  const deleteProjectMutation = useDeleteProject({});
  const handleDeleteConfirmation = () => {
    deleteProjectMutation.mutate(projectToBeDeleted, {
      onSuccess: ({ data: d }) => {
        console.log('onSuccess', d);

        addToast('success-delete-project', (
          <>
            <p className="text-sm">
              {`The project with id: ${projectToBeDeleted} was successfully deleted`}
            </p>
          </>
        ), {
          level: 'success',
        });
      },
      onError: () => {
        addToast('error-delete-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              {`There was an error deleting the project with id: ${projectToBeDeleted}`}
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  };

  return (
    <Wrapper>
      <Loading
        visible={isFetching}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />

      {isFetched && data.length && (
        <div
          className={cx({
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
          })}
        >
          {data.map((d) => {
            return (
              <Item
                key={`${d.id}`}
                {...d}
                onDelete={() => {
                  setProjectToBeDeleted(d.id);
                  setShowDeleteModal(true);
                }}
              />
            );
          })}
        </div>
      )}

      {isFetched && !data.length && (
        <div className="text-white">
          No projects found
        </div>
      )}
      <Modal
        open={showDeleteModal}
        title="Are you sure you want to delete this project?"
        onClose={() => setShowDeleteModal(false)}
        className="max-w-lg"
      >
        <h1 className="text-xl text-black w-60">Are you sure you want to delete this project?</h1>
        <div className="flex items-end justify-between">
          <div className="flex h-12">
            <Button
              theme="secondary"
              size="lg"
              className="w-28"
              onClick={() => setShowDeleteModal(false)}
            >
              No
            </Button>
            <Button
              theme="primary"
              size="lg"
              className="ml-4 w-28"
              onClick={handleDeleteConfirmation}
            >
              Yes
            </Button>
          </div>
          <Icon
            icon={DELETE_PROJECT}
            className="w-24 h-24"
          />
        </div>
      </Modal>
    </Wrapper>
  );
};

export default ProjectsList;
