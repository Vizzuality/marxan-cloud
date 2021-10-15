import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { usePasswordChangeConfirmation } from 'hooks/me';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';

export interface ChangePasswordConfirmationProps {
}

export const ChangePasswordConfirmation: React.FC<ChangePasswordConfirmationProps> = () => {
  const { push, query: { token: confirmToken } } = useRouter();
  const [confirmChangePasswordToken, setConfirmChangePasswordToken] = useState(false);

  const passwordChangeConfirmationMutation = usePasswordChangeConfirmation({});

  const confirmPasswordChange = useCallback(() => {
    const data = { confirmToken };
    passwordChangeConfirmationMutation.mutate({ data }, {
      onSuccess: () => {
        setConfirmChangePasswordToken(true);
      },
      onError: () => {
        setConfirmChangePasswordToken(false);
      },
    });
  }, [passwordChangeConfirmationMutation, confirmToken]);

  useEffect(() => {
    return () => {
      confirmPasswordChange();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmToken]);

  return (
    <Wrapper>
      {confirmChangePasswordToken && (
        <div className="relative flex items-center justify-center h-full">
          <div className="w-full max-w-xs">
            <div className="pb-5">
              <h2 className="mb-24 text-lg font-medium text-center text-gray-600 font-heading">
                You&apos;ve change your password!
              </h2>
            </div>
            <div className="mt-10">
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
      )}

      {!confirmChangePasswordToken && (
        <div className="relative flex items-center justify-center h-full">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center pb-5 space-y-20">
              <h2 className="text-lg font-medium text-center text-gray-600 font-heading">
                Sorry, it seems that you have not change yout password.
              </h2>
              <p className="mb-12 text-sm text-gray-500">
                Please check your email inbox.
              </p>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ChangePasswordConfirmation;
