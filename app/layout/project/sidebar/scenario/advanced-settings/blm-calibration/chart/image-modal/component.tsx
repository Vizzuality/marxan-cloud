import React from 'react';

import { OverlayContainer } from '@react-aria/overlays';
import { AnimatePresence, motion } from 'framer-motion';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface BlmImageModalProps {
  blmImage: string;
  zoomImage: boolean;
  setZoomImage: (zoomImage: boolean) => void;
}

export const BlmImageModal: React.FC<BlmImageModalProps> = ({
  blmImage,
  zoomImage,
  setZoomImage,
}: BlmImageModalProps) => (
  <AnimatePresence>
    {zoomImage && (
      <OverlayContainer>
        <motion.div
          id="overlay"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: zoomImage ? 1 : 0,
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
          className="bg-blur fixed inset-0 z-50 bg-black"
        >
          <div className="absolute left-0 right-0 top-2/4 mx-auto h-full w-full text-center">
            <button className="relative" type="button" onClick={() => setZoomImage(false)}>
              <img
                src={blmImage}
                alt="selected blm"
                className="h-60 w-60 rounded-xl border-4 border-transparent hover:border-primary-500"
              />
              <div className="absolute bottom-0 right-0 z-50 mb-0.5 mr-0.5 flex h-6 w-6 items-center justify-center rounded-br-lg rounded-tl-lg bg-primary-500">
                <Icon icon={CLOSE_SVG} className="h-3 w-3 text-black" />
              </div>
            </button>
          </div>
        </motion.div>
      </OverlayContainer>
    )}
  </AnimatePresence>
);

export default BlmImageModal;
