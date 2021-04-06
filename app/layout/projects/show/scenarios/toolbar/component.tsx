import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/projects/detail';

import Search from 'components/search';

export interface ProjectScenariosToolbarProps {
}

export const ProjectScenariosToolbar: React.FC<ProjectScenariosToolbarProps> = () => {
  const { search } = useSelector((state) => state['/projects/[id]']);
  const dispatch = useDispatch();

  useEffect(() => {
    // setSearch to null wheneverer you unmount this component
    return function unmount() {
      dispatch(setSearch(null));
    };
  }, [dispatch]);

  return (
    <div className="mb-5">
      <Search
        defaultValue={search}
        size="base"
        placeholder="Search by scenario name..."
        aria-label="Search"
        onChange={(value) => { dispatch(setSearch(value)); }}
      />

    </div>
  );
};

export default ProjectScenariosToolbar;
