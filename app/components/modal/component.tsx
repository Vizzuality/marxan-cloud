import React from 'react';
import cx from 'classnames';
import ReactModal from 'react-modal';

import Icon from 'components/icon';
import CLOSE_SVG from 'svgs/ui/close.svg';

const COMMON_CONTENT_CLASSES = 'absolute top-1/2 inset-x-4 sm:left-1/2 max-h-full transform -translate-y-1/2 sm:-translate-x-1/2 outline-none bg-white overflow-auto rounded-3xl py-7 px-8';
const CONTENT_CLASSES = {
  narrow: `sm:w-4/6 md:w-1/2 lg:w-5/12 xl:w-1/3 ${COMMON_CONTENT_CLASSES}`,
  default: `sm:w-4/5 md:w-2/3 lg:1/2 xl:w-2/5 ${COMMON_CONTENT_CLASSES}`,
  wide: `sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-3/5 ${COMMON_CONTENT_CLASSES}`,
};

const OVERLAY_CLASSES = 'z-10 fixed inset-0 bg-black bg-blur';

export interface ModalProps {
  /**
   * Title used by screen readers
   */
  title: string;
  /**
   * Whether the modal is opened or closed
   */
  open: boolean;
  /**
   * Callback executed when the component requests its closure
   */
  onClose: (event: React.MouseEvent) => void;
  /**
   * Size (width) of the modal
   */
  size?: 'narrow' | 'default' | 'wide';
  /**
   * Callback executed after the modal has opened
   */
  onAfterOpen?: () => void;
  /**
   * Callback executed after the modal has closed
   */
  onAfterClose?: () => void;
  children?: React.ReactNode;
  /**
   * Class name to assign to the modal
   */
  className?: string;
}

// appElement is the root of the Next application
// In Storybook, this element doesn't exist hence the condition
if (typeof document !== 'undefined') {
  const appElement = document.querySelector('#__next');
  if (appElement) {
    ReactModal.setAppElement(appElement);
  }
}

export const Modal: React.FC<ModalProps> = ({
  title,
  open,
  onClose,
  size = 'default',
  onAfterOpen,
  onAfterClose,
  children,
  className,
}: ModalProps) => (
  <ReactModal
    isOpen={open}
    onRequestClose={onClose}
    onAfterOpen={onAfterOpen}
    onAfterClose={onAfterClose}
    contentLabel={title}
    className={cx({ [CONTENT_CLASSES[size]]: true, [className]: !!className })}
    overlayClassName={cx({ [OVERLAY_CLASSES]: true })}
  >
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-0 right-0 text-sm text-gray-300 focus:text-black hover:text-black"
      >
        Close
        <Icon
          icon={CLOSE_SVG}
          className="inline-block w-4 h-4 ml-2 text-black"
        />
      </button>
    </div>
    {children}
  </ReactModal>
);

export default Modal;
