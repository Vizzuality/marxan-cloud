import React, { useCallback, useState } from 'react';

import { PLANNING_AREA_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Form, Field as FieldRFF } from 'react-final-form';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

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

  const onDropAccepted = async (acceptedFiles) => {
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

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? { error, message: `File is larger than ${bytesToMegabytes(PLANNING_AREA_UPLOADER_MAX_SIZE)} MB` }
        : error;
    });

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

  const onUploadSubmit = useCallback((values) => {
    input.onChange({
      name: values.name,
      logoDataUrl: successFile.base64,
    });
  }, [successFile, input]);

  const onUploadRemove = useCallback((f) => {
    input.onChange(null);
    setSuccessFile(null);
    reset(f);
  }, [input, reset]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: PLANNING_AREA_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mt-3 mb-5">
      {!!input.value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col w-full space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-50 p-2.5">
                <img src={input.value.logoDataUrl} alt={input.value.name} className="max-w-full" />
              </div>
              <label className="px-3 py-1 bg-blue-100 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                <p className="text-sm text-primary-500">{input.value.name}</p>
              </label>
              <button
                aria-label="remove"
                id="cancel-shapefile-btn"
                type="button"
                className="flex flex-shrink-0 items-center justify-center w-5 h-5 border border-white rounded-full group bg-black"
                onClick={() => {
                  onUploadRemove(form);
                  setOpened(false);
                }}
              >
                <Icon
                  className="w-1.5 h-1.5 text-white"
                  icon={CLOSE_SVG}
                />
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
                    <h4 className="mb-5 text-lg text-black font-heading">Upload company</h4>

                    <div className="space-y-5">
                      <FieldRFF
                        name="name"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field id="name" {...fprops}>
                            <div className="flex items-center mb-3 space-x-2">
                              <Label theme="light" className="uppercase" id="name">
                                Name
                              </Label>
                            </div>
                            <Input theme="light" type="text" placeholder="Write company name..." />
                          </Field>
                        )}
                      </FieldRFF>

                      {!successFile && (
                        <FieldRFF name="dropFile" validate={composeValidators([{ presence: true }])}>
                          {(props) => (
                            <div>
                              <Label theme="light" className="uppercase" id="image">
                                Image
                              </Label>

                              <div className="flex items-center my-2.5 space-x-3">
                                <h5 className="text-xs text-gray-400">Supported formats</h5>
                                <InfoButton
                                  size="s"
                                  theme="secondary"
                                >
                                  <span className="text-xs">
                                    {' '}
                                    <h4 className="font-heading mb-2.5">
                                      List of supported file formats:
                                    </h4>
                                    <ul>
                                      Zipped: .shp (zipped shapefiles must include
                                      <br />
                                      .shp, .shx, .dbf, and .prj files)
                                    </ul>
                                  </span>
                                </InfoButton>
                              </div>

                              <div
                                {...props}
                                {...getRootProps()}
                                className={cx({
                                  'relative py-10 w-full bg-gray-100 bg-opacity-20 border border-dotted border-gray-300 hover:bg-gray-100 cursor-pointer': true,
                                  'bg-gray-500': isDragActive,
                                  'border-green-800': isDragAccept,
                                  'border-red-800': isDragReject || (props?.meta?.error && props?.meta?.touched),
                                })}
                              >

                                <input {...getInputProps()} />

                                <p className="text-sm text-center text-gray-500">
                                  Drag and drop your image
                                  <br />
                                  or
                                  {' '}
                                  <b>click here</b>
                                  {' '}
                                  to upload
                                </p>

                                <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(PLANNING_AREA_UPLOADER_MAX_SIZE)} MB`}</p>

                                <Loading
                                  visible={loading}
                                  className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
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
                          <div className="flex flex-col w-full space-y-3 cursor-pointer">
                            <h5 className="text-xs text-black uppercase">Uploaded file:</h5>
                            <div className="flex items-center space-x-2">
                              <label className="px-3 py-1 bg-gray-400 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                                <p className="text-sm text-black">{successFile.path}</p>
                              </label>
                              <button
                                id="cancel-shapefile-btn"
                                type="button"
                                className="flex items-center justify-center w-5 h-5 border border-black rounded-full group hover:bg-black"
                                onClick={() => {
                                  setSuccessFile(null);
                                }}
                              >
                                <Icon
                                  className="w-1.5 h-1.5 text-black group-hover:text-white"
                                  icon={CLOSE_SVG}
                                />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center mt-16 space-x-6">
                      <Button
                        theme="secondary"
                        size="xl"
                        onClick={() => setOpened(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        theme="primary"
                        size="xl"
                        type="submit"
                      >
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
