import React, { useCallback, useEffect, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useDebouncedCallback } from 'use-debounce';

import { Button } from 'components/button/component';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Search from 'components/search';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';

export interface EditContributorsDropdownProps {
  setEditUsers: (editUsers: boolean) => void;
}

export const EditContributorsDropdown: React.FC<EditContributorsDropdownProps> = ({
  setEditUsers,
}: EditContributorsDropdownProps) => {
  const [search, setSearch] = useState(null);

  const onChangeSearchDebounced = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

  useEffect(() => {
    return function unmount() {
      setSearch(null);
    };
  }, [search]);

  const handleSubmit = useCallback((values) => {
    console.info('values', values);
    setEditUsers(false);
  }, [setEditUsers]);

  return (
    <div className="absolute z-40 flex flex-col items-center bg-white top-14 -right-2 p-9 rounded-3xl">
      <div className="text-sm text-black pb-9">Project members</div>
      <Search
        id="user-search"
        size="base"
        defaultValue={search}
        placeholder="Search connections..."
        aria-label="Search"
        onChange={onChangeSearchDebounced}
        theme="light"
      />
      <p className="self-start py-6 text-xs text-black uppercase font-heading">2 contributors</p>
      <FormRFF
        onSubmit={handleSubmit}
        initialValues={{}}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex flex-col">

            <FieldRFF name="email" className="flex flex-col py-12">
              {(fprops) => (
                <Field id="email" {...fprops}>
                  <Label theme="light" className="self-start mb-3 uppercase">EMAIL</Label>
                  <Input theme="light" icon={EMAIL_SVG} type="password" />
                </Field>
              )}
            </FieldRFF>

            <Button
              className="flex-shrink-0 text-xs px-36 whitespace-nowrap"
              theme="primary"
              size="lg"
              type="submit"
            >
              Save changes
            </Button>
          </form>
        )}
      </FormRFF>
    </div>
  );
};

export default EditContributorsDropdown;
