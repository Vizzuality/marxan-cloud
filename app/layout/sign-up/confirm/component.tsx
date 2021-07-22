import React from 'react';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';

import CHECK_EMAIL_SVG from 'svgs/users/check-email.svg?sprite';

export interface ConfirmSignUpProps {
  setConfirm: (confirm: boolean) => void,
}

export const ConfirmSignUp: React.FC<ConfirmSignUpProps> = ({ setConfirm }:ConfirmSignUpProps) => {
  return (
    <Wrapper>

      <div className="flex flex-col items-center justify-center my-auto space-y-12">

        <h2 className="text-lg font-medium text-center text-gray-600 font-heading">Check your email</h2>

        <Icon icon={CHECK_EMAIL_SVG} className="w-28" />

        <div className="w-72">
          <p className="text-lg text-center text-gray-600 font-heading">We have sent a link to confirmate your sign up...</p>
        </div>

        <div className="flex pt-10 space-x-4 border-t border-gray-200 w-72">
          <p className="text-base text-center text-gray-300 font-heading">
            Did not receive the email? Check your spam filter, or
            {' '}
            <span
              role="presentation"
              className="text-black underline cursor-pointer"
              onClick={() => setConfirm(false)}
            >
              try another email address.
            </span>
          </p>
        </div>

      </div>

    </Wrapper>
  );
};

export default ConfirmSignUp;
