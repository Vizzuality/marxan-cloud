import React from 'react';
import cx from 'classnames';

import { useSelector } from 'react-redux';

import Wrapper from 'layout/wrapper';
import Item from 'components/projects/item';

import { useProjects } from 'hooks/projects';

export interface ProjectsListProps {

}

export const ProjectsList: React.FC<ProjectsListProps> = () => {
  const { search } = useSelector((state) => state['/projects']);
  const { data } = useProjects({ search });

  return (
    <Wrapper>
      <div
        className={cx({
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
        })}
      >
        {data.map((d) => {
          return <Item key={`${d.id}`} {...d} />;
        })}
      </div>
    </Wrapper>
  );
};

export default ProjectsList;
