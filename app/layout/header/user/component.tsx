import React from 'react';

import Icon from 'components/icon';
import Button from 'components/button';
import Avatar from 'components/avatar';
import Tooltip from 'components/tooltip';

import { useAuth } from 'hooks/authentication';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

export interface HeaderUserProps {
}

export const HeaderUser: React.FC<HeaderUserProps> = () => {
  const auth = useAuth();

  return (
    <Tooltip
      arrow
      trigger="click"
      placement="bottom-end"
      interactive
      content={(
        <div className="p-5">
          <Button theme="primary" size="s" onClick={auth.signout}>Logout</Button>
        </div>
      )}
    >
      <button
        type="button"
        className="flex items-center justify-start focus:outline-none"
      >
        <Avatar className="text-sm text-white uppercase bg-primary-700">
          MB
        </Avatar>
        <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5 text-white" />
      </button>
    </Tooltip>
  );
};

export default HeaderUser;
