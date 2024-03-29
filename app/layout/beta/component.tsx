/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';

import { useCookies } from 'react-cookie';

import Button from 'components/button';
import Modal from 'components/modal';
import Wrapper from 'layout/wrapper';

export interface HomeBetaProps {}

export const HomeBeta: React.FC<HomeBetaProps> = () => {
  const [open, setOpen] = useState(false);

  const [cookies, setCookie] = useCookies(['beta']);

  useEffect(() => {
    setOpen(!cookies.beta);
  }, [cookies.beta]);

  return (
    <>
      <div className="relative z-10 w-full bg-yellow-600">
        <Wrapper>
          <div className="flex items-center space-x-5 py-2 text-sm text-gray-800">
            <p>
              We note that this is <strong>a temporary site</strong> and your account and personal
              information <strong>will not be stored</strong> beyond the Beta stage, nor shared
              beyond MaPP Admin.
            </p>
            <Button
              theme="secondary"
              size="s"
              className="flex-shrink-0 whitespace-nowrap"
              onClick={() => setOpen(true)}
            >
              See full message.
            </Button>
          </div>
        </Wrapper>
      </div>
      <Modal
        open={open}
        onDismiss={() => {
          setOpen(false);
          setCookie('beta', 'true', { path: '/' });
        }}
      >
        <div className="space-y-2.5 overflow-y-auto overflow-x-hidden p-10 pb-2.5 text-gray-800">
          <h2 className="mb-5 text-2xl">Welcome to the Marxan Planning Platform (MaPP) - Beta!</h2>
          <p>
            While we put the finishing touches on development, we invite you to come inside and see
            what Marxan MaPP has to offer. Once you complete registration and enter the platform,
            you can bring the Okavango demo from the Community page into your dashboard and start
            exploring!
          </p>
          <p>
            We note that this is a temporary site and your account and personal information will not
            be stored beyond the Beta stage, nor shared beyond MaPP Admin. Once we complete
            development in August 2022 or earlier, you will be able to register a permanent account
            and start planning with Marxan. We will notify you before we make this transition.
          </p>
          <p>
            By entering the site, you acknowledge that any data or information you load in will not
            be saved beyond the Beta stage.
          </p>
          <p>
            Please leave us feedback or feel free to contact us with questions{' '}
            <a
              className="text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            >
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
            .
          </p>
          <p>Thank you, Marxan</p>
        </div>
      </Modal>
    </>
  );
};

export default HomeBeta;
