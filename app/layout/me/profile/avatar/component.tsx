import React, { useState } from 'react';

import { useDropzone } from 'react-dropzone';

import { motion } from 'framer-motion';

import { useMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Avatar from 'components/avatar';
import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import IMAGE_SVG from 'svgs/ui/image.svg?sprite';

export interface AvatarMeProps {
  value?: string,
  onChange?: (s: string) => {}
}

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export const AvatarMe: React.FC<AvatarMeProps> = ({ value, onChange }: AvatarMeProps) => {
  const { user } = useMe();
  const { addToast } = useToasts();
  const [preview, setPreview] = useState(value);
  const [hover, setHover] = useState(false);

  const onRemove = (e) => {
    e.preventDefault();
    setPreview(null);
    onChange(null);
  };

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    const url = await toBase64(f);
    setPreview(`${url}`);
    onChange(`${url}`);
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];
    const { errors } = r;

    addToast('drop-error', (
      <>
        <h2 className="font-medium">Error!</h2>
        <ul className="text-sm">
          {errors.map((e) => (
            <li key={`${e.code}`}>{e.message}</li>
          ))}
        </ul>
      </>
    ), {
      level: 'error',
    });
  };

  const { open, getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    multiple: false,
    noClick: true,
    noKeyboard: true,
    maxSize: 5e5,
    onDropAccepted,
    onDropRejected,
  });

  const { displayName } = user;

  return (
    <div
      className="relative"
    >
      <div
        role="presentation"
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} />

        <div className="relative w-16 h-16">
          <button
            type="button"
            className="relative w-16 h-16 overflow-hidden rounded-full"
            onClick={open}
            onMouseEnter={() => { setHover(true); }}
            onMouseLeave={() => { setHover(false); }}
          >
            <Avatar className="w-16 h-16 text-sm text-white uppercase bg-blue-700" bgImage={preview}>
              {!preview && displayName.slice(0, 2)}
            </Avatar>

            <motion.div
              className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full h-full bg-blue-600 rounded-full"
              animate={hover ? 'enter' : 'exit'}
              initial={{ opacity: 0, y: '50%' }}
              transition={{
                duration: 0.2,
              }}
              variants={{
                enter: {
                  opacity: 1,
                  y: '0%',
                },
                exit: {
                  opacity: 0,
                  y: '50%',
                },

              }}
            >
              <Icon icon={IMAGE_SVG} className="w-4 h-4 text-white" />
            </motion.div>
          </button>

          {preview && (
            <button
              aria-label="remove"
              type="button"
              className="absolute p-1 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full top-1 right-1"
              onClickCapture={onRemove}
            >
              <Icon icon={CLOSE_SVG} className="w-2 h-2 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarMe;
