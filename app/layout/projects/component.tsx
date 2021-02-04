import React from 'react';
import cx from 'classnames';

import Wrapper from 'layout/wrapper';
import Item from 'components/projects/item';

import { useProjects } from 'hooks/projects';

export interface ProjectsProps {

}

export const Projects: React.FC<ProjectsProps> = () => {
  const { data } = useProjects();

  return (
    <Wrapper>
      <div
        className={cx({
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
        })}
      >
        {data.map((item) => {
          return <Item key={`${item.id}`} {...item} />;
        })}
      </div>
    </Wrapper>
  );
};

export default Projects;
