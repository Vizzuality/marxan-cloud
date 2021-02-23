import React from 'react';
import cx from 'classnames';

import { useSelector } from 'react-redux';

import Wrapper from 'layout/wrapper';

import Loading from 'components/loading';
import Item from 'components/projects/item';

import { useProjects } from 'hooks/projects';

export interface ProjectsListProps {

}

export const ProjectsList: React.FC<ProjectsListProps> = () => {
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
            return <Item key={`${d.id}`} {...d} />;
          })}
        </div>
      )}

      {isFetched && !data.length && (
        <div className="text-white">
          No projects found
        </div>
      )}
    </Wrapper>
  );
};

export default ProjectsList;
