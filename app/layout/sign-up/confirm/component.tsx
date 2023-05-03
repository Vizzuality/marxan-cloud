import React from 'react';

import Icon from 'components/icon';
import Wrapper from 'layout/wrapper';

import CHECK_EMAIL_SVG from 'svgs/users/check-email.svg?sprite';

export interface ConfirmSignUpProps {
  setConfirm: (confirm: boolean) => void;
}

export const ConfirmSignUp: React.FC<ConfirmSignUpProps> = ({ setConfirm }: ConfirmSignUpProps) => {
  return (
    <Wrapper>
      <div className="my-auto flex flex-col items-center justify-center space-y-12">
        <h2 className="text-center font-heading text-lg font-medium text-gray-600">
          Check your email
        </h2>

        <Icon icon={CHECK_EMAIL_SVG} className="w-28" />

        <div className="w-72">
          <p className="text-center font-heading text-lg text-gray-600">
            We have sent a link to your email to confirm your account...
          </p>
        </div>

        <div className="flex w-72 space-x-4 border-t border-gray-200 pt-10">
          <p className="text-center font-heading text-base text-gray-300">
            Did not receive the email? Check your spam filter, or{' '}
            <span
              role="presentation"
              className="cursor-pointer text-black underline"
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
