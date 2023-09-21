import React, { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import Button from 'components/button';
import Wrapper from 'layout/wrapper';

import AUTHENTICATION from 'services/authentication';

export interface SignUpConfirmationProps {}

export const SignUpConfirmation: React.FC<SignUpConfirmationProps> = () => {
  const {
    push,
    query: { token: confirmToken, userId },
  } = useRouter();
  const [confirmedAccountToken, setConfirmedAccountToken] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const confirmAccount = useCallback(async () => {
    const data = { validationToken: confirmToken, sub: userId };
    try {
      await AUTHENTICATION.request({
        method: 'POST',
        url: '/validate',
        data,
      });

      setConfirmedAccountToken(true);
      setIsValidated(true);
    } catch (error) {
      setConfirmedAccountToken(false);
      setIsValidated(true);
      console.error(error);
    }
  }, [confirmToken, userId]);

  useEffect(() => {
    confirmAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmToken]);

  return (
    <Wrapper>
      {confirmedAccountToken && isValidated && (
        <div className="relative flex h-full items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="pb-5">
              <h2 className="mb-24 text-center font-heading text-lg font-medium text-gray-700">
                Welcome to Marxan!
                <br />
                You&apos;ve created an account
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

      {!confirmedAccountToken && isValidated && (
        <div className="relative flex h-full items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center space-y-20 pb-5">
              <h2 className="text-center font-heading text-lg font-medium text-gray-700">
                Sorry, it seems that you have not created an account.
              </h2>
              <p className="mb-12 text-sm text-gray-600">
                You can{' '}
                <Link href="/auth/sign-up" className="text-black underline hover:no-underline">
                  create an account.
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default SignUpConfirmation;
