import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/projects';

import Wrapper from 'layout/wrapper';

import Link from 'next/link';
import Search from 'components/search';
import Button from 'components/button';
import Icon from 'components/icon';

import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

export interface ProjectsToolbarProps {

}

export const ProjectsToolbar: React.FC<ProjectsToolbarProps> = () => {
  const { search } = useSelector((state) => state['/projects']);
  const dispatch = useDispatch();

  return (
    <Wrapper>
      <div className="flex items-baseline justify-between gap-20 mb-8">
        <div className="flex-grow">
          <Search
            defaultValue={search}
            size="base"
            placeholder="Search by project name, planning area name..."
            aria-label="Search"
            onChange={(value) => { dispatch(setSearch(value)); }}
          />
        </div>

        <div className="flex gap-1">
          <Link href="/projects/new" passHref>
            <a
              href="/projects/new"
            >
              <Button theme="primary" size="base">
                <span>Create new project</span>
                <Icon className="w-3 h-3 ml-4" icon={PLUS_SVG} />
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsToolbar;
