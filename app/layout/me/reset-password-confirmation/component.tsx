import React from 'react';

import { useRouter } from 'next/router';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Icon from 'components/icon';

import SECURITY_SVG from 'svgs/notifications/security.svg?sprite';

export interface ResetPasswordConfirmationProps {
}

export const ResetPasswordConfirmation: React.FC<ResetPasswordConfirmationProps> = () => {
  const { push } = useRouter();
  return (
    <Wrapper>
      <div className="relative flex items-center justify-center h-full">
        <div className="flex flex-col items-center w-full max-w-xs">

          <h2 className="mb-24 text-lg font-medium text-center text-gray-600 font-heading">
            You&apos;ve change your password!
          </h2>

          <Icon icon={SECURITY_SVG} className="w-72 h-72" />

          <div className="w-full mt-16">
            <Button
              theme="tertiary"
              size="lg"
              type="submit"
              onClick={() => push('/auth/sign-in')}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ResetPasswordConfirmation;
