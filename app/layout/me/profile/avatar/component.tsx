import React, { useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { useMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Avatar from 'components/avatar';
import Icon from 'components/icon';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

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

export const AvatarMe: React.FC<AvatarMeProps> = ({ value, onChange }:AvatarMeProps) => {
  const { user } = useMe();
  const { addToast } = useToasts();
  const [preview, setPreview] = useState(value);

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
    maxSize: 500000,
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

        <div className="relative w-10 h-10">
          <button
            type="button"
            onClick={open}
          >
            <Avatar className="text-sm text-white uppercase bg-primary-700" bgImage={preview}>
              {!preview && displayName.slice(0, 2)}
            </Avatar>
          </button>

          {preview && (
            <button
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
