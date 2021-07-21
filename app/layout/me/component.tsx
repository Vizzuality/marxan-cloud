import React from 'react';

import Profile from 'layout/me/profile';
import ChangePassword from 'layout/me/change-password';
import DeleteAccount from 'layout/me/delete-account';

export interface MeProps {

}

export const Me: React.FC<MeProps> = () => {
  return (
    <div className="flex w-full h-full">
      <div className="w-1/3 bg-white p-14">
        <Profile />
      </div>
      <div className="w-2/3 py-24 bg-gray-100">
        <div className="py-10 border-b border-gray-200 px-36">
          <ChangePassword />
        </div>
        <div className="py-14 px-36">
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
};

export default Me;
