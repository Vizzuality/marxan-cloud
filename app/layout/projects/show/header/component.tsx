import React, { useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useRoleMe } from 'hooks/project-users';

import Title from 'layout/header/title';
import Contributors from 'layout/projects/show/header/contributors';
import Toolbar from 'layout/projects/show/header/toolbar';
import Wrapper from 'layout/wrapper';

import Breadcrumb from 'components/breadcrumb';
import Icon from 'components/icon';

import EDIT_SVG from 'svgs/project/edit.svg?sprite';

export interface ProjectsHeaderProps {

}

export const ProjectsHeader: React.FC<ProjectsHeaderProps> = () => {
  const { query, push } = useRouter();
  const [editable, setEditable] = useState(false);
  const { pid } = query;

  const { data: roleMe } = useRoleMe(pid);

  const VIEWER = roleMe === 'project_viewer';

  const handleEdition = () => setEditable(!editable);

  return (
    <Wrapper>
      <Breadcrumb
        onClick={() => {
          push('/projects');
        }}
      >
        All projects
      </Breadcrumb>

      <div className="flex justify-between mt-5">
        <div className="flex-col w-2/4">
          <div className="flex items-center w-full space-x-5">
            <Title editable={editable} />
            <button
              type="button"
              className={cx({
                'cursor-pointer focus:outline-none h-10 w-10 px-3 rounded-full border border-gray-500 flex items-center justify-center': true,
                'bg-transparent': !editable,
                'bg-white': editable,
              })}
              disabled={VIEWER}
              onClick={handleEdition}
            >
              <Icon
                icon={EDIT_SVG}
                className={cx({
                  'w-4 h-4': true,
                  'text-white': !editable,
                  'text-black': editable,
                })}
              />
            </button>
          </div>
          {/* <Description editable={editable} /> */}
        </div>

        <div className="flex flex-col items-end flex-shrink-0 space-y-6">
          <Contributors />
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
