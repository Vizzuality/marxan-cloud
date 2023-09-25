import React, { useCallback, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form, Field as FieldRFF } from 'react-final-form';

import { motion } from 'framer-motion';

import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';
import { COMPANY_LOGO_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { cn } from 'utils/cn';
import { bytesToKilobytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface CompanyUploaderProps {
  input: any;
  form: any;
  reset: (form) => void;
}

export const CompanyUploader: React.FC<CompanyUploaderProps> = ({
  input,
  form,
  reset,
}: CompanyUploaderProps) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);

  const { addToast } = useToasts();

  const onDropAccepted = (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    setLoading(true);
    const f = acceptedFiles[0];

    // convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = async () => {
      const base64 = reader.result;

      setLoading(false);
      setSuccessFile({
        ...f,
        base64,
      });
    };
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToKilobytes(COMPANY_LOGO_UPLOADER_MAX_SIZE)} KB`,
          }
        : error;
    });

    addToast(
      'drop-error',
      <>
        <h2 className="font-medium">Error!</h2>
        <ul className="text-sm">
          {errors.map((e) => (
            <li key={`${e.code}`}>{e.message}</li>
          ))}
        </ul>
      </>,
      {
        level: 'error',
      }
    );
  };

  const onUploadSubmit = useCallback(
    (values) => {
      input.onChange({
        name: values.name,
        logoDataUrl: successFile.base64,
      });
    },
    [successFile, input]
  );

  const onUploadRemove = useCallback(
    (f) => {
      input.onChange(null);
      setSuccessFile(null);
      reset(f);
    },
    [input, reset]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: COMPANY_LOGO_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mb-5 mt-3">
      {!!input.value && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex w-full flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2.5">
                <img src={input.value.logoDataUrl} alt={input.value.name} className="max-w-full" />
              </div>
              <label
                className="rounded-3xl bg-blue-200 bg-opacity-10 px-3 py-1"
                htmlFor="cancel-shapefile-btn"
              >
                <p className="text-sm text-primary-500">{input.value.name}</p>
              </label>
              <button
                aria-label="remove"
                id="cancel-shapefile-btn"
                type="button"
                className="group flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white bg-black"
                onClick={() => {
                  onUploadRemove(form);
                  setOpened(false);
                }}
              >
                <Icon className="h-1.5 w-1.5 text-white" icon={CLOSE_SVG} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!input.value && (
        <Uploader
          id="company-uploader"
          caption="Upload logo"
          open={opened}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
        >
          <Form
            onSubmit={onUploadSubmit}
            render={({ handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="p-9">
                    <h4 className="mb-5 font-heading text-lg text-black">Upload company</h4>

                    <div className="space-y-5">
                      <FieldRFF name="name" validate={composeValidators([{ presence: true }])}>
                        {(fprops) => (
                          <Field id="name" {...fprops}>
                            <div className="mb-3 flex items-center space-x-2">
                              <Label theme="light" className="uppercase" id="name">
                                Name
                              </Label>
                            </div>
                            <Input theme="light" type="text" placeholder="Write company name..." />
                          </Field>
                        )}
                      </FieldRFF>

                      {!successFile && (
                        <FieldRFF
                          name="dropFile"
                          validate={composeValidators([{ presence: true }])}
                        >
                          {(props) => (
                            <div>
                              <Label theme="light" className="uppercase" id="image">
                                Image
                              </Label>

                              <div className="my-2.5 flex items-center space-x-3">
                                <h5 className="text-xs text-gray-600">Supported formats</h5>
                                <InfoButton size="s" theme="secondary">
                                  <span className="text-xs">
                                    {' '}
                                    <h4 className="mb-2.5 font-heading">
                                      List of supported file formats:
                                    </h4>
                                    <ul>.jpg and .png files</ul>
                                  </span>
                                </InfoButton>
                              </div>

                              <div
                                {...props}
                                {...getRootProps()}
                                className={cn({
                                  'relative w-full cursor-pointer border border-dotted border-gray-400 bg-gray-200 bg-opacity-20 py-10 hover:bg-gray-200':
                                    true,
                                  'bg-gray-600': isDragActive,
                                  'border-green-900': isDragAccept,
                                  'border-red-900':
                                    isDragReject || (props?.meta?.error && props?.meta?.touched),
                                })}
                              >
                                <input {...getInputProps()} />

                                <p className="text-center text-sm text-gray-600">
                                  Drag and drop your image
                                  <br />
                                  or <b>click here</b> to upload
                                </p>

                                <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToKilobytes(
                                  COMPANY_LOGO_UPLOADER_MAX_SIZE
                                )} KB`}</p>

                                <Loading
                                  visible={loading}
                                  className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
                                  iconClassName="w-5 h-5 text-primary-500"
                                />
                              </div>
                            </div>
                          )}
                        </FieldRFF>
                      )}

                      {successFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex w-full cursor-pointer flex-col space-y-3">
                            <h5 className="text-xs uppercase text-black">Uploaded file:</h5>
                            <div className="flex items-center space-x-2">
                              <label
                                className="rounded-3xl bg-gray-100 bg-opacity-10 px-3 py-1"
                                htmlFor="cancel-shapefile-btn"
                              >
                                <p className="text-sm text-black">{successFile.path}</p>
                              </label>
                              <button
                                id="cancel-shapefile-btn"
                                type="button"
                                className="group flex h-5 w-5 items-center justify-center rounded-full border border-black hover:bg-black"
                                onClick={() => {
                                  setSuccessFile(null);
                                }}
                              >
                                <Icon
                                  className="h-1.5 w-1.5 text-black group-hover:text-white"
                                  icon={CLOSE_SVG}
                                />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-16 flex justify-center space-x-6">
                      <Button theme="secondary" size="xl" onClick={() => setOpened(false)}>
                        Cancel
                      </Button>

                      <Button theme="primary" size="xl" type="submit">
                        Save
                      </Button>
                    </div>
                  </div>
                </form>
              );
            }}
          />
        </Uploader>
      )}
    </div>
  );
};

export default CompanyUploader;
