import React from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';
import { cn } from 'utils/cn';

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
  <Modal open={open} title={title} size="narrow" dismissable={dismissible} onDismiss={onDismiss}>
    <div className="px-8 py-4">
      <header>
        <div className="leading-1 mt-8 font-heading text-xl font-medium text-gray-900 sm:mt-0 sm:pr-32">
          {title}
        </div>
        <p
          className={cn({
            'my-4 text-sm sm:pr-32': true,
            'text-black underline': !!danger,
            'text-gray-900': !danger,
          })}
        >
          {description}
        </p>
      </header>
      <div
        className={cn({
          'flex items-end justify-between': true,
          'mt-10 sm:mt-12': !icon && !description,
          'mt-8': !icon && !!description,
          'mt-10 sm:mt-1': !!icon && !description,
          'mt-8 sm:mt-1': !!icon && !!description,
        })}
      >
        <div
          className={cn({
            flex: true,
            'flex-row-reverse': !!danger,
          })}
        >
          {!!onRefuse && (
            <Button
              theme="secondary"
              size="lg"
              className="mr-5 w-32 flex-shrink-0"
              onClick={onRefuse}
            >
              {options.refuseText}
            </Button>
          )}

          {!!onAccept && (
            <Button
              theme={danger ? 'danger' : 'primary'}
              size="lg"
              className="w-32 flex-shrink-0 sm:mr-5"
              onClick={onAccept}
            >
              {options.acceptText}
            </Button>
          )}
        </div>

        {icon && (
          <Icon
            icon={icon}
            className={cn({
              'flex-shrink-1 flex-grow-1 hidden sm:block': true,
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
