import React, { useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import Title from 'layout/header/title';
import ComingSoon from 'layout/help/coming-soon';
import Contributors from 'layout/projects/show/header/contributors';
import Description from 'layout/projects/show/header/description';
import Toolbar from 'layout/projects/show/header/toolbar';
import Wrapper from 'layout/wrapper';

import Breadcrumb from 'components/breadcrumb';
import Icon from 'components/icon';

import EDIT_SVG from 'svgs/project/edit.svg?sprite';

export interface ProjectsHeaderProps {

}

export const ProjectsHeader: React.FC<ProjectsHeaderProps> = () => {
  const { push } = useRouter();
  const [editable, setEditable] = useState(false);
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
          <div className="flex items-center space-x-5">
            <Title editable={editable} />
            <button
              type="button"
              onClick={handleEdition}
              className={cx({
                'cursor-pointer focus:outline-none h-10 w-10 px-3 rounded-full border border-gray-500 flex items-center justify-center': true,
                'bg-transparent': !editable,
                'bg-white': editable,
              })}
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
          <Description editable={editable} />
        </div>

        <div className="flex flex-col items-end flex-shrink-0 space-y-6">
          <ComingSoon>
            <Contributors />
          </ComingSoon>
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
