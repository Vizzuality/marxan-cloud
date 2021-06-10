import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';
import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/projects/detail';

import Search from 'components/search';

export interface ProjectScenariosToolbarProps {
}

export const ProjectScenariosToolbar: React.FC<ProjectScenariosToolbarProps> = () => {
  const { search } = useSelector((state) => state['/projects/[id]']);
  const dispatch = useDispatch();

  const onChangeDebounced = useDebouncedCallback((value) => {
    dispatch(setSearch(value));
  }, 500);

  useEffect(() => {
    // setSearch to null wheneverer you unmount this component
    return function unmount() {
      dispatch(setSearch(null));
    };
  }, [dispatch]);

  return (
    <Search
      size="base"
      defaultValue={search}
      placeholder="Search by scenario name..."
      aria-label="Search"
      onChange={onChangeDebounced}
    />
  );
};

export default ProjectScenariosToolbar;
