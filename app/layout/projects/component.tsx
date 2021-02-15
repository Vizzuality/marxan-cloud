import React from 'react';
import cx from 'classnames';

import Wrapper from 'layout/wrapper';
import Item from 'components/projects/item';

import { useProjects } from 'hooks/projects';
import { useTransition, config } from 'react-spring';

export interface ProjectsProps {

}

export const Projects: React.FC<ProjectsProps> = () => {
  const { data } = useProjects();

  const transition = useTransition(data, (item) => item.id, {
    config: config.gentle,
    unique: true,
    trail: 500 / data.length,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <Wrapper>
      <div
        className={cx({
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
        })}
      >
        {transition.map(({ key, item, props }) => {
          return <Item key={`${key}`} {...item} style={props} />;
        })}
      </div>
    </Wrapper>
  );
};

export default Projects;
