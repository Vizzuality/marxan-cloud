import React from 'react';

import {
  OverlayContainer,
} from '@react-aria/overlays';
import { AnimatePresence, motion } from 'framer-motion';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface BlmImageModalProps {
  blmImage: string,
  zoomImage: boolean,
  setZoomImage: (zoomImage: boolean) => void,
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
          className="fixed inset-0 z-50 bg-black bg-blur"
        >
          <div className="absolute left-0 right-0 w-full h-full mx-auto text-center top-2/4">
            <button
              className="relative"
              type="button"
              onClick={() => setZoomImage(false)}
            >
              <img src={blmImage} alt="selected blm" className="border-4 border-transparent rounded-xl hover:border-primary-500 w-60 h-60" />
              <div className="absolute bottom-0 right-0 z-50 flex items-center justify-center w-6 h-6 mb-0.5 mr-0.5 rounded-tl-lg rounded-br-lg bg-primary-500">
                <Icon icon={CLOSE_SVG} className="w-3 h-3 text-black" />
              </div>
            </button>
          </div>

        </motion.div>
      </OverlayContainer>
    )}
  </AnimatePresence>

);

export default BlmImageModal;
