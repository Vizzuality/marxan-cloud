import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { useToasts } from 'hooks/toast';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import {
  composeValidators,
} from 'components/forms/validations';
import Icon from 'components/icon';
import Loading from 'components/loading';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import RESET_PASSWORD_SVG from 'svgs/users/reset-password.svg?sprite';

export interface ResetPasswordPasswordProps {

}

export const ResetPasswordPassword: React.FC<ResetPasswordPasswordProps> = () => {
  const { push } = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { addToast } = useToasts();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);
    try {
      // Forgot password mutation
      console.info('FORGOT PASSWORD', data);
      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      addToast('error-forgot-password', (
        <>
          <h2 className="font-medium">Error!</h2>
          <p className="text-sm">Invalid username or password.</p>
        </>
      ), {
        level: 'error',
      });

      setSubmitting(false);
      console.error(err);
    }
  }, [addToast]);

  return (
    <Wrapper>

      {!submitted && (
        <FormRFF
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex items-center justify-center h-full">
              <div className="w-full max-w-xs">
                <h2 className="mb-5 text-lg font-medium text-center text-gray-600 font-heading">Reset Password</h2>
                <p className="mb-5 text-sm text-gray-500">Enter the email associated with your account and we’ll send and email with instructions to reset your password.</p>

                <Loading
                  visible={submitting}
                  className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                  iconClassName="w-10 h-10 text-primary-500"
                />

                {/* EMAIL */}
                <div>
                  <FieldRFF
                    name="username"
                    validate={composeValidators([{ presence: true, email: true }])}
                  >
                    {(fprops) => (
                      <Field id="forgot-password-username" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">Email</Label>
                        <Input theme="light" type="email" icon={EMAIL_SVG} />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="mt-10">
                  <Button theme="primary" size="lg" type="submit" disabled={submitting} className="w-full">
                    Recover password
                  </Button>
                </div>
              </div>

            </form>
          )}
        </FormRFF>
      )}

      {submitted && (
        <div className="relative flex items-center justify-center h-full">
          <div className="w-full max-w-xs">
            <div className="pb-5">
              <h2 className="mb-24 text-lg font-medium text-center text-gray-600 font-heading">You&apos;ve changed your password</h2>
              <Icon icon={RESET_PASSWORD_SVG} className="w-56 h-56 mx-auto mb-5 text-gray-500" />
            </div>
            <div className="mt-10">
              <Button
                theme="tertiary"
                size="lg"
                type="submit"
                disabled={submitting}
                onClick={() => {
                  setSubmitted(false);
                  push('sign-in');
                }}
                className="w-full"
              >
                Ok
              </Button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ResetPasswordPassword;
