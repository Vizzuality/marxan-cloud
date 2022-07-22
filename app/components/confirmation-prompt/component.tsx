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
  iconClassName,
  danger = false,
  options = {
    acceptText: 'Yes',
    refuseText: 'No',
  },
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
      <header>
        <div className="mt-8 text-xl font-medium text-gray-800 leading-1 sm:mt-0 sm:pr-32 font-heading">
          {title}
        </div>
        <p className={classnames({
          'my-4 text-sm sm:pr-32': true,
          'underline text-black': !!danger,
          'text-gray-400': !danger,
        })}
        >
          {description}
        </p>
      </header>
      <div
        className={classnames({
          'flex justify-between items-end': true,
          'mt-10 sm:mt-12': !icon && !description,
          'mt-8': !icon && !!description,
          'mt-10 sm:mt-1': !!icon && !description,
          'mt-8 sm:mt-1': !!icon && !!description,
        })}
      >
        <div className={classnames({
          flex: true,
          'flex-row-reverse': !!danger,
        })}
        >
          {!!onRefuse && (
            <Button
              theme="secondary"
              size="lg"
              className="flex-shrink-0 w-32 mr-5"
              onClick={onRefuse}
            >
              {options.refuseText}
            </Button>
          )}

          {!!onAccept && (
            <Button
              theme={danger ? 'danger' : 'primary'}
              size="lg"
              className="flex-shrink-0 w-32 sm:mr-5"
              onClick={onAccept}
            >
              {options.acceptText}
            </Button>
          )}
        </div>

        {icon && (
          <Icon
            icon={icon}
            className={classnames({
              'hidden sm:block flex-shrink-1 flex-grow-1': true,
              'ml-auto w-36': !iconClassName,
              [iconClassName]: !!iconClassName,
            })}
          />
        )}
      </div>
    </div>
  </Modal>
);

export default ConfirmationPrompt;
