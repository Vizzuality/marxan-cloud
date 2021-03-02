import React, { cloneElement } from 'react';
import cx from 'classnames';
import { useOverlayTriggerState } from '@react-stately/overlays';
import {
  useOverlay,
  usePreventScroll,
  useModal,
  OverlayContainer,
} from '@react-aria/overlays';
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';

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
   * Element that triggers the modal to open
   */
  trigger: React.ReactElement<{ onClick: () => void }>;
  /**
   * Whether the user can close the modal by clicking on the overlay, the close button or pressing
   * the escape key
   */
  dismissable?: boolean;
  /**
   * Size (width) of the modal
   */
  size?: 'narrow' | 'default' | 'wide';
  children?: React.ReactNode;
  /**
   * Class name to assign to the modal
   */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  trigger,
  dismissable = true,
  size = 'default',
  children,
  className,
}: ModalProps) => {
  const { isOpen, close, open } = useOverlayTriggerState({});

  const containerRef = React.useRef();
  const { overlayProps } = useOverlay({
    isKeyboardDismissDisabled: !dismissable,
    isDismissable: dismissable,
    isOpen,
    onClose: close,
  }, containerRef);
  const { modalProps } = useModal();
  const { dialogProps } = useDialog({ 'aria-label': title }, containerRef);

  usePreventScroll();

  return (
    <>
      {cloneElement(trigger, { onClick: open })}
      {isOpen && (
        <OverlayContainer>
          <div className={cx({ [OVERLAY_CLASSES]: true })}>
            <FocusScope contain restoreFocus autoFocus>
              <div
                {...overlayProps}
                {...dialogProps}
                {...modalProps}
                ref={containerRef}
                className={cx({ [CONTENT_CLASSES[size]]: true, [className]: !!className })}
              >
                {dismissable && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={close}
                      className="absolute top-0 right-0 text-sm text-gray-300 focus:text-black hover:text-black"
                    >
                      Close
                      <Icon
                        icon={CLOSE_SVG}
                        className="inline-block ml-2 w-4 h-4 text-black"
                      />
                    </button>
                  </div>
                )}
                {children}
              </div>
            </FocusScope>
          </div>
        </OverlayContainer>
      )}
    </>
  );
};

export default Modal;
