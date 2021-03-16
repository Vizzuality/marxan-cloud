import React from 'react';

import Wrapper from 'layout/wrapper';
import Profile from 'layout/me/profile';
import ChangePassword from 'layout/me/change-password';
import DeleteAccount from 'layout/me/delete-account';

export interface MeProps {

}

export const Me: React.FC<MeProps> = () => {
  return (
    <Wrapper>
      <div className="pb-20 divide-y">
        <div className="py-10 bg-white">
          <Profile />
        </div>
        <div className="py-10 mt-10">
          <ChangePassword />
        </div>
        <div className="py-10 mt-10">
          <DeleteAccount />
        </div>
      </div>
    </Wrapper>
  );
};

export default Me;
