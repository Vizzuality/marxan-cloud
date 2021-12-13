import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import Link from 'next/link';

import { setSearch } from 'store/slices/projects';

import HelpBeacon from 'layout/help/beacon';
import ComingSoon from 'layout/help/coming-soon';
import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Icon from 'components/icon';
import Search from 'components/search';

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
          id="project-search"
          title="Quick search"
          subtitle="Project list"
          content={(
            <div>
              Find your projects by typing in keywords.
              You can search by project name,
              scenario name, planning region, contributors, etc.
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
            id="project-new"
            title="Create new project"
            subtitle="Project list"
            content={(
              <div>
                Creating a project is the first step to be able to
                perform a Marxan analysis.
                Under a project you can create multiple alternative scenarios that
                share the same planning region.

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
            id="project-upload"
            title="Upload project"
            subtitle="Project list"
            content={(
              <div>
                You can upload an existing Marxan project.
                You will need to compress your input files
                as a zipfile and you will need to add your planning unit grid
                as a shapefile. Optionally you can include your output files
                to visualize the results.
              </div>
            )}
          >
            <div>
              <ComingSoon>
                <Button theme="secondary" size="base">
                  <span>Upload project</span>
                  <Icon className="w-3 h-3 ml-4" icon={UPLOAD_SVG} />
                </Button>
              </ComingSoon>
            </div>
          </HelpBeacon>
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsToolbar;
