import React from 'react';

import classnames from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import { ConfirmationPromptProps } from './types';

export const ConfirmationPrompt: React.FC<ConfirmationPromptProps> = ({
  title,
  description,
  open,
  dismissible = true,
  icon,
  danger = false,
  onDismiss,
  onAccept,
  onRefuse,
}: ConfirmationPromptProps) => (
  <Modal
    open={open}
    title={title}
    size="narrow"
    dismissable={dismissible}
    onDismiss={onDismiss}
  >
    <div className="px-8 py-4">
      <div className="pr-20">
        <div className="mt-8 text-xl font-medium text-gray-800 leading-1 sm:mt-0 sm:pr-32 font-heading">
          {title}
        </div>
        <p className={classnames({
          'mt-4 text-sm sm:pr-32': true,
          'underline text-black': !!danger,
          'text-gray-400': !danger,
        })}
        >
          {description}
        </p>
      </div>
      <div
        className={classnames({
          'flex justify-start items-end': true,
          'mt-10 sm:mt-12': !icon && !description,
          'mt-8': !icon && !!description,
          'mt-10 sm:mt-1': !!icon && !description,
          'mt-8 sm:-mt-2': !!icon && !!description,
        })}
      >
        <div className={classnames({
          flex: true,
          'flex-row-reverse': !!danger,
        })}
        >
          <Button
            theme="secondary"
            size="lg"
            className="flex-shrink-0 w-32 mr-5"
            onClick={onRefuse}
          >
            No
          </Button>
          <Button
            theme={danger ? 'danger' : 'primary'}
            size="lg"
            className="flex-shrink-0 w-32 sm:mr-5"
            onClick={onAccept}
          >
            Yes
          </Button>
        </div>
        {icon && (
          <Icon icon={icon} className="hidden ml-auto sm:block flex-shrink-1 flex-grow-1 w-36" />
        )}
      </div>
    </div>
  </Modal>
);

export default ConfirmationPrompt;
