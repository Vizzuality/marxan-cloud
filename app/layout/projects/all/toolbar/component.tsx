import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/projects';

import Wrapper from 'layout/wrapper';

import Link from 'next/link';
import Search from 'components/search';
import Button from 'components/button';
import Icon from 'components/icon';
import HelpBeacon from 'layout/help/beacon';

import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

export interface ProjectsToolbarProps {

}

export const ProjectsToolbar: React.FC<ProjectsToolbarProps> = () => {
  const { search } = useSelector((state) => state['/projects']);
  const dispatch = useDispatch();

  return (
    <Wrapper>
      <div className="flex items-baseline justify-between mb-8 space-x-20">
        <HelpBeacon
          title="Quick search"
          subtitle="Project list"
          content={(
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Beatae ratione cumque in nobis fugiat,
              neque ullam aliquam, commodi dolorem unde inventore eaque,
              dolorum eveniet! Corrupti voluptatum molestias quaerat voluptatem ipsa.
            </div>
          )}
        >
          <div className="flex-grow">
            <Search
              id="project-search"
              defaultValue={search}
              size="base"
              placeholder="Search by project name, planning area name..."
              aria-label="Search"
              onChange={(value) => { dispatch(setSearch(value)); }}
            />
          </div>
        </HelpBeacon>

        <div className="flex space-x-4">
          <HelpBeacon
            title="Create new project"
            subtitle="Project list"
            content={(
              <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Beatae ratione cumque in nobis fugiat,
                neque ullam aliquam, commodi dolorem unde inventore eaque,
                dolorum eveniet! Corrupti voluptatum molestias quaerat voluptatem ipsa.
              </div>
            )}
          >
            <div>
              <Link href="/projects/new">
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
          </HelpBeacon>

          <HelpBeacon
            title="Upload project"
            subtitle="Project list"
            content={(
              <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Beatae ratione cumque in nobis fugiat,
                neque ullam aliquam, commodi dolorem unde inventore eaque,
                dolorum eveniet! Corrupti voluptatum molestias quaerat voluptatem ipsa.
              </div>
            )}
          >
            <div>
              <Button theme="secondary" size="base">
                <span>Upload project</span>
                <Icon className="w-3 h-3 ml-4" icon={UPLOAD_SVG} />
              </Button>
            </div>
          </HelpBeacon>
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsToolbar;
