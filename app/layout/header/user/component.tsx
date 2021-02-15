import React, { useCallback, useRef, useState } from 'react';

import Icon from 'components/icon';
import Button from 'components/button';
import Avatar from 'components/avatar';

import { useAuth } from 'hooks/authentication';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import { usePopper } from 'react-popper';

export interface HeaderUserProps {
}

export const HeaderUser: React.FC<HeaderUserProps> = () => {
  const [opened, setOpened] = useState(false);
  const auth = useAuth();

  const triggerRef = useRef();
  const menuRef = useRef();

  // 'usePopper'
  const { styles, attributes } = usePopper(triggerRef.current, menuRef.current, {
    placement: 'bottom',
  });

  const onClickUser = useCallback(() => {
    setOpened(!opened);
  }, [opened]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center justify-start focus:outline-none"
        onClick={onClickUser}
      >
        <Avatar className="text-sm text-white uppercase bg-primary-700">
          MB
        </Avatar>
        <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5 text-white" />
      </button>

      <div
        ref={menuRef}
        className="z-50"
        style={styles.popper}
        {...attributes.popper}
      >
        {opened && (
          <div className="p-4 bg-gray-700 shadow">
            <Button theme="primary" size="s" onClick={auth.signout}>Logout</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderUser;
