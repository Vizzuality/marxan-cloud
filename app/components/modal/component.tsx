import React, { Children, cloneElement, isValidElement, useEffect, ReactElement } from 'react';

import cx from 'classnames';

import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays';
import { AnimatePresence, motion } from 'framer-motion';

import { useMultipleModal } from 'hooks/modal';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { ModalProps } from './types';

const COMMON_CONTENT_CLASSES =
  'absolute h-full sm:h-auto top-1/2 inset-x-4 left-1/2 transform -translate-y-1/2 -translate-x-1/2 outline-none bg-white flex flex-col flex-grow overflow-hidden rounded-3xl py-7';
const CONTENT_CLASSES = {
  narrow: `w-full sm:w-4/6 md:w-1/2 lg:w-5/12 xl:w-1/3 ${COMMON_CONTENT_CLASSES}`,
  default: `w-full sm:w-4/5 md:w-2/3 lg:1/2 xl:w-2/5 ${COMMON_CONTENT_CLASSES}`,
  wide: `w-full sm:w-10/12 md:w-10/12 lg:w-10/12 xl:w-9/12 2xl:w-6/12 ${COMMON_CONTENT_CLASSES}`,
};

const OVERLAY_CLASSES = 'z-50 fixed inset-0 bg-black bg-blur';

export const Modal: React.FC<ModalProps> = ({
  id,
  title,
  open,
  dismissable = true,
  size = 'default',
  children,
  className,
  onDismiss,
}: ModalProps) => {
  const containerRef = React.useRef();
  const { overlayProps } = useOverlay(
    {
      isKeyboardDismissDisabled: !dismissable,
      isDismissable: dismissable,
      isOpen: open,
      onClose: onDismiss,
      shouldCloseOnInteractOutside: (element) => {
        return element.getAttribute('id') === 'overlay';
      },
    },
    containerRef
  );
  const { modalProps } = useModal();
  const { dialogProps } = useDialog({ 'aria-label': title }, containerRef);

  usePreventScroll({ isDisabled: !open });

  const { modals, addMultipleModal, removeMultipleModal } = useMultipleModal();
  const { visible = true } = modals.find((m) => m.id === id) || {};

  useEffect(() => {
    if (id && open) {
      addMultipleModal({
        id,
        visible: open,
      });
    }

    if (id && !open) {
      removeMultipleModal({
        id,
      });
    }

    return () => {
      removeMultipleModal({
        id,
      });
    };
  }, [id, open]); // eslint-disable-line

  return (
    <AnimatePresence>
      {open && (
        <OverlayContainer>
          <motion.div
            id="overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: visible ? 1 : 0,
              transition: {
                delay: 0,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                delay: 0.125,
              },
            }}
            className={cx({ [OVERLAY_CLASSES]: true })}
          >
            <FocusScope restoreFocus autoFocus>
              <div {...overlayProps} {...dialogProps} {...modalProps} ref={containerRef}>
                <motion.div
                  initial={{
                    opacity: 0,
                    y: '-60%',
                    x: '-50%',
                  }}
                  animate={{
                    opacity: 1,
                    y: '-50%',
                    x: '-50%',
                    transition: {
                      delay: 0.125,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: '-60%',
                    x: '-50%',
                    transition: {
                      delay: 0,
                    },
                  }}
                  className={cx({ [CONTENT_CLASSES[size]]: true, [className]: !!className })}
                  style={{
                    maxHeight: '90%',
                  }}
                >
                  {dismissable && (
                    <div className="relative z-10">
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="absolute -top-4 right-4 flex items-center px-4 py-4 text-sm text-gray-400 hover:text-black focus:text-black"
                      >
                        <span className="text-xs">Close</span>
                        <Icon icon={CLOSE_SVG} className="ml-2 inline-block h-3 w-3 text-black" />
                      </button>
                    </div>
                  )}

                  {/* Children */}
                  {Children.map(children, (child: ReactElement<ModalProps>) => {
                    if (isValidElement(child)) {
                      return cloneElement(child, {
                        onDismiss,
                      });
                    }
                    return null;
                  })}
                </motion.div>
              </div>
            </FocusScope>
          </motion.div>
        </OverlayContainer>
      )}
    </AnimatePresence>
  );
};

export default Modal;
