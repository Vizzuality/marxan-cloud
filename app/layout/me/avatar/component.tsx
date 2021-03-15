import React, { useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { useMe } from 'hooks/me';

import Avatar from 'components/avatar';

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
  const [preview, setPreview] = useState(value);

  const onDrop = async (acceptedFiles) => {
    const f = acceptedFiles[0];
    const url = await toBase64(f);
    setPreview(`${url}`);
    onChange(`${url}`);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    multiple: false,
    onDrop,
  });

  const { displayName } = user;

  return (
    <div
      className="relative"
    >
      <div
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} />

        <Avatar className="text-sm text-white uppercase bg-primary-700" bgImage={preview}>
          {!preview && displayName.slice(0, 2)}
        </Avatar>
      </div>
    </div>
  );
};

export default AvatarMe;
