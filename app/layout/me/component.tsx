import React from 'react';

import Profile from 'layout/me/profile';
import ChangePassword from 'layout/me/change-password';
import DeleteAccount from 'layout/me/delete-account';

export interface MeProps {

}

export const Me: React.FC<MeProps> = () => {
  return (
    <div className="w-full h-full md:flex">
      <div className="bg-white md:w-1/3 p-14">
        <Profile />
      </div>
      <div className="py-24 bg-gray-100 md:w-2/3">
        <div className="border-b border-gray-200 py-14 px-36">
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
