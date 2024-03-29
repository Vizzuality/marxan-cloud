import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRequestRecoverPassword } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Wrapper from 'layout/wrapper';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import CHECK_EMAIL_SVG from 'svgs/users/check-email.svg?sprite';

export interface ForgotPasswordProps {}

export const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const requestRecoverMutation = useRequestRecoverPassword({});
  const { addToast } = useToasts();

  const handleSubmit = useCallback(
    async (values) => {
      setSubmitting(true);
      const { forgotPasswordEmail } = values;
      const data = {
        email: forgotPasswordEmail,
      };

      requestRecoverMutation.mutate(
        { data },
        {
          onSuccess: () => {
            addToast(
              'success-request-recover-password',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">
                  If that email address is in our database, we will send you an email to reset your
                  password.
                </p>
              </>,
              {
                level: 'success',
              }
            );
            setSubmitting(false);
            setSubmitted(true);
          },
          onError: () => {
            addToast(
              'error--request-recover-password',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Try again!</p>
              </>,
              {
                level: 'error',
              }
            );
            setSubmitting(false);
          },
        }
      );
    },
    [requestRecoverMutation, addToast]
  );

  return (
    <Wrapper>
      {!submitted && (
        <FormRFF onSubmit={handleSubmit}>
          {(props) => (
            <form
              onSubmit={props.handleSubmit}
              autoComplete="off"
              className="relative flex h-full items-center justify-center"
            >
              <div className="w-full max-w-xs">
                <h2 className="mb-5 text-center font-heading text-lg font-medium text-gray-700">
                  Forgot Password
                </h2>
                <p className="mb-5 text-sm text-gray-600">
                  Enter the email associated with your account and we’ll send and email with
                  instructions to reset your password.
                </p>

                <Loading
                  visible={submitting}
                  className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
                  iconClassName="w-10 h-10 text-primary-500"
                />

                {/* EMAIL */}
                <div>
                  <FieldRFF
                    name="forgotPasswordEmail"
                    validate={composeValidators([{ presence: true, email: true }])}
                  >
                    {(fprops) => (
                      <Field id="forgot-password-email" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">
                          Email
                        </Label>
                        <Input theme="light" type="email" icon={EMAIL_SVG} />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="mt-10">
                  <Button
                    theme="primary"
                    size="lg"
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    Recover password
                  </Button>
                </div>
              </div>
            </form>
          )}
        </FormRFF>
      )}

      {submitted && (
        <div className="relative flex h-full items-center justify-center">
          <div className="w-full max-w-xs divide-y-2 divide-gray-200">
            <div className="pb-5">
              <h2 className="mb-5 text-center font-heading text-lg font-medium text-gray-700">
                Check your email
              </h2>
              <Icon icon={CHECK_EMAIL_SVG} className="mx-auto mb-5 h-16 w-16 text-gray-600" />
              <p className="mx-auto text-center text-sm text-gray-100" style={{ maxWidth: 300 }}>
                We have sent password recovery instructions to your email...
              </p>
            </div>
            <div className="pt-5">
              <p
                className="mx-auto mb-5 text-center text-sm text-gray-100"
                style={{ maxWidth: 300 }}
              >
                Did not receive the email? Check your spam filter, or{' '}
                <span
                  role="presentation"
                  className="text-black underline"
                  onClick={() => setSubmitted(false)}
                >
                  try another email address.
                </span>
              </p>
              <p
                className="mx-auto mb-5 text-center text-sm text-gray-100"
                style={{ maxWidth: 300 }}
              >
                Please note that if you have not activated your account yet, by following the link
                on the welcome email after signing up, you will need to activate your account before
                trying to reset your password. If you did not receive a confirmation email, please
                check your spam folder. Activation links in welcome emails are only valid for 24
                hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ForgotPassword;
