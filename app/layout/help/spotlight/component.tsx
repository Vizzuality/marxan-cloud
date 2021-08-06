import React, {
  MutableRefObject, useEffect, useRef, useState,
  useCallback,
} from 'react';

import { motion } from 'framer-motion';

interface HelpSpotlightProps {
  childrenRef: MutableRefObject<HTMLDivElement | null>;
}

export const HelpSpotlight = ({
  childrenRef,
}: HelpSpotlightProps) => {
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef(null);

  const getCanvasSize = () => {
    const { width, height } = document.body.getBoundingClientRect();

    setCanvasSize({
      width, height,
    });
  };

  const drawBackground = useCallback((CTX, reference) => {
    const { width: canvaswidth, height: canvasheight } = canvasSize;

    if (reference.current) {
      const {
        top, left, width, height,
      } = reference.current.getBoundingClientRect();

      const gradient = CTX.createRadialGradient(
        left + width / 2,
        top + height / 2,
        width,
        left + width / 2,
        top + height / 2,
        height,
      );

      // Add three color stops
      gradient.addColorStop(0, 'rgba(0,0,0,0.75)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      CTX.clearRect(0, 0, canvaswidth, canvasheight);

      CTX.beginPath();
      CTX.rect(0, 0, canvaswidth, canvasheight);
      CTX.fillStyle = 'rgba(0,0,0,0.75)';
      // CTX.fillStyle = gradient;
      CTX.fill();
    }
  }, [canvasSize]);

  const drawHighlight = useCallback((CTX, reference) => {
    if (reference.current) {
      const {
        top, left, width, height,
      } = reference.current.getBoundingClientRect();

      CTX.globalCompositeOperation = 'destination-out';
      CTX.beginPath();
      CTX.rect(left, top, width, height);
      CTX.fillStyle = 'white';
      CTX.fill();
    }
  }, []);

  const updateCanvas = useCallback(() => {
    const CTX = canvasRef.current.getContext('2d');
    CTX.save();

    drawBackground(CTX, childrenRef);
    drawHighlight(CTX, childrenRef);

    CTX.restore();
  }, [childrenRef, drawBackground, drawHighlight]);

  useEffect(() => {
    getCanvasSize();

    window.addEventListener('resize', getCanvasSize);

    return () => {
      window.removeEventListener('resize', getCanvasSize);
    };
  }, []);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  return (
    <motion.canvas
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="absolute top-0 left-0 z-50"
    />
  );
};

export default HelpSpotlight;
