import React from 'react';

import ChangePassword from 'layout/me/change-password';
import DeleteAccount from 'layout/me/delete-account';
import Profile from 'layout/me/profile';

export interface MeProps {}

export const Me: React.FC<MeProps> = () => {
  return (
    <div className="h-full w-full md:flex">
      <div className="bg-white p-14 md:w-1/3">
        <Profile />
      </div>
      <div className="bg-gray-100 py-24 md:w-2/3">
        <div className="border-b border-gray-200 px-36 py-14">
          <ChangePassword />
        </div>
        <div className="px-36 py-14">
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
};

export default Me;
