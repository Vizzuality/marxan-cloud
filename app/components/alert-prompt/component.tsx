import React from 'react';
import classnames from 'classnames';

import Modal, { ModalProps } from 'components/modal';
import Button from 'components/button';
import Icon, { IconProps } from 'components/icon';

export interface AlertPromptProps {
  /**
   * Title of the prompt
   */
  title: string;
  /**
   * Description displayed below the title
   */
  description?: string;
  /**
   * Whether the prompt is diplayed
   */
  open: ModalProps['open'],
  /**
   * Whether the user can close the prompt without having to accept nor refuse
   */
  dismissible?: ModalProps['dismissable'],
  /**
   * Optional icon to display in the prompt. It is not displayed on narrow screens (< 640px).
   */
  icon?: IconProps['icon'],
  /**
   * Name of the optional secondary action the user can perform
   */
  secondaryActionName?: string;
  /**
   * Callback executed when the user accepts the action
   */
  onAccept?: () => void,
  /**
   * Callback executed when the user clicks on the secondary action button
   */
  onClickSecondaryAction?: () => void,
  /**
   * Callback executed when the user dismisses the prompt. Only relevant if `dismissible` is true or
   * unset.
   */
  onDismiss: ModalProps['onDismiss'],
}

export const ConfirmationPrompt: React.FC<AlertPromptProps> = ({
  title,
  description,
  open,
  dismissible = true,
  icon,
  secondaryActionName,
  onDismiss,
  onAccept = () => {},
  onClickSecondaryAction = () => {},
}: AlertPromptProps) => (
  <Modal
    open={open}
    title={title}
    size="narrow"
    dismissable={dismissible}
    onDismiss={onDismiss}
  >
    <div className="mt-8 sm:mt-0 sm:pr-20 text-xl font-heading font-medium leading-9">
      {title}
    </div>
    <p className="mt-4 sm:pr-32 text-sm text-gray-400">{description}</p>
    <div
      className={classnames({
        'flex justify-start items-end': true,
        'mt-10 sm:mt-12': !icon && !description,
        'mt-8': !icon && !!description,
        'mt-10 sm:mt-1': !!icon && !description,
        'mt-8 sm:-mt-2': !!icon && !!description,
      })}
    >
      <div className="flex justify-start items-center">
        <Button
          theme="secondary"
          size="base"
          className="mr-5 flex-shrink-0"
          onClick={onAccept}
        >
          Ok
        </Button>
        {secondaryActionName && (
        <button
          type="button"
          className="sm:mr-5 flex-shrink-0 text-sm text-black underline"
          onClick={onClickSecondaryAction}
        >
          {secondaryActionName}
        </button>
        )}
      </div>
      {icon && (
        <Icon icon={icon} className="hidden sm:block flex-shrink-1 flex-grow-1 ml-auto w-36" />
      )}
    </div>
  </Modal>
);

export default ConfirmationPrompt;
