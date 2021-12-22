import React, { useCallback } from 'react';

import { Form as FormRFF } from 'react-final-form';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Select from 'components/forms/select';

import { ROLES } from './constants';

export interface UserCardProps {
  name: string,
  image?: string,
  roleName: string,
}

export const UserCard: React.FC<UserCardProps> = ({
  name, image, roleName,
}: UserCardProps) => {
  const handleSubmit = useCallback((values) => {
    console.info('values', values);
  }, []);

  return (
    <FormRFF
      onSubmit={handleSubmit}
      initialValues={{}}
    >
      {(props) => (
        <form
          onSubmit={props.handleSubmit}
          autoComplete="off"
          className="box-border flex items-center justify-between flex-grow w-full py-3 pl-3 pr-6 bg-gray-100 rounded-3xl"

        >
          <div className="flex flex-grow space-x-3">
            <Avatar
              className="box-border text-sm text-white uppercase border-none bg-primary-700"
              bgImage={image}
              name={name}
              size="lg"
            >
              {!image && name.slice(0, 2)}
            </Avatar>
            <div className="self-center space-y-0.5 flex w-52 flex-col flex-grow">
              <p className="text-sm text-black clamp-1">{name}</p>
              <div className="pr-20">
                <Select
                  initialSelected={ROLES[roleName]}
                  maxHeight={300}
                  onBlur={() => { }}
                  onChange={() => { }}
                  onFocus={() => { }}
                  onSelect={() => { }}
                  options={[
                    {
                      label: 'Owner',
                      value: 'project_owner',
                    },
                    {
                      label: 'Contributor',
                      value: 'project_contributor',
                    },
                    {
                      label: 'Viewer',
                      value: 'project_viewer',
                    },
                  ]}
                  placeholder={ROLES[roleName]}
                  size="s"
                  status="none"
                  theme="light"
                />
              </div>
            </div>

          </div>
          <Button
            className="flex-shrink-0 h-6 py-2 text-sm bg-gray-600 group"
            theme="secondary-alt"
            size="xs"
            type="submit"
          >
            <span className="text-white group-hover:text-gray-600">Remove</span>
          </Button>
        </form>
      )}
    </FormRFF>
  );
};

export default UserCard;
