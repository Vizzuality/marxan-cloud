import React, { useState } from 'react';
import cx from 'classnames';

import { useSelector } from 'react-redux';

import Wrapper from 'layout/wrapper';

import Loading from 'components/loading';
import Item from 'components/projects/item';
import Modal from 'components/modal';
import Button from 'components/button';

import { useProjects } from 'hooks/projects';
import Icon from 'components/icon';

import DELETE_PROJECT from 'svgs/projects/delete-project.svg?sprite';

import { ProjectsListProps } from './types';

export const ProjectsList: React.FC<ProjectsListProps> = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToBeDeleted, setProjectToBeDeleted] = useState<string>(null);
  const { search } = useSelector((state) => state['/projects']);
  const {
    data, isFetching, isFetched,
  } = useProjects({ search });

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
              onClick={() => {
                console.log('delete', projectToBeDeleted);
              }}
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
