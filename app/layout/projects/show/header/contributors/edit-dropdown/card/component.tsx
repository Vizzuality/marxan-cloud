import React from 'react';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import USER_REMOVE_SVG from 'svgs/users/user-remove.svg?sprite';

import { ROLES, ROLE_OPTIONS } from './constants';

export interface UserCardProps {
  id: string,
  name: string,
  image?: string,
  roleName: string,

}

export const UserCard: React.FC<UserCardProps> = ({
  id, name, image, roleName,
}: UserCardProps) => {
  return (
    <div className="box-border flex items-center justify-between flex-grow w-full py-3 pl-3 pr-6 space-x-3 bg-gray-100 rounded-3xl">
      <Avatar
        className="box-border px-3 text-sm text-white uppercase border-none bg-primary-700"
        bgImage={image}
        name={name}
        size="lg"
      >
        {!image && name.slice(0, 2)}
      </Avatar>
      <div className="flex flex-col self-center flex-grow w-full space-y-1">
        <p className="text-sm text-black clamp-1">{name}</p>
        <div className="pr-20">
          <Select
            initialSelected={ROLES[roleName]}
            maxHeight={300}
            onChange={(value: string) => console.log('role selected', value, 'id', id)}
            options={ROLE_OPTIONS}
            placeholder={ROLES[roleName]}
            size="s"
            status="none"
            theme="light"
          />
        </div>
      </div>
      <Tooltip
        arrow
        interactive
        popup
        content={(
          <div className="flex flex-row p-2 space-x-3 text-sm text-gray-500 bg-white rounded-2xl">
            <Icon className="w-10 h-10" icon={USER_REMOVE_SVG} />
            <p>
              Are you sure you want to
              <br />
              remove
              <strong>
                {' '}
                {name}
                {' '}
              </strong>
              from
              <br />
              this project?
            </p>
            <div className="flex flex-col w-16 space-y-2">
              <Button
                theme="primary"
                size="xs"
                className="cursor-pointer"
                onClick={() => console.log('remove', id)}
              >
                Yes
              </Button>
              <Button
                data-close
                theme="tertiary"
                size="xs"
                className="cursor-pointer"
                onClick={() => { }}
              >
                No
              </Button>
            </div>
          </div>
        )}
        placement="top-end"
        trigger="click"
      >
        <span>
          <Button
            className="flex-shrink-0 h-6 py-2 text-sm bg-gray-600 group"
            theme="secondary-alt"
            size="xs"
          >
            <span className="text-white group-hover:text-gray-600">Remove</span>
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};

export default UserCard;
