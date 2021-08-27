import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  setBbox, setUploadingPlanningArea, setMaxPuAreaSize, setMinPuAreaSize,
} from 'store/slices/projects/new';

import { motion } from 'framer-motion';

import { useUploadProjectPA } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';
import Uploader from 'components/uploader';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface PlanningAreUploaderProps {
  input: any;
  form: any;
  resetPlanningArea: (form) => void;
}

export const PlanningAreUploader: React.FC<PlanningAreUploaderProps> = ({
  input,
  form,
  resetPlanningArea,
}: PlanningAreUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const { addToast } = useToasts();

  const dispatch = useDispatch();

  const uploadProjectPAMutation = useUploadProjectPA({
    requestConfig: {
      method: 'POST',
    },
  });

  const maxSize = 3000000;

  const { uploadingPlanningArea } = useSelector((state) => state['/projects/new']);

  // Effects
  useEffect(() => {
    return () => {
      input.onChange(null);
      dispatch(setUploadingPlanningArea(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadProjectPAMutation.mutate({ data }, {
      onSuccess: ({ data: { data: g, id: PAid } }) => {
        setLoading(false);
        setSuccessFile({ id: PAid, name: f.name });
        input.onChange(PAid);

        addToast('success-upload-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile uploaded</p>
          </>
        ), {
          level: 'success',
        });

        dispatch(setUploadingPlanningArea(g));
        dispatch(setBbox(g.bbox));
        dispatch(setMinPuAreaSize(g.marxanMetadata.minPuAreaSize));
        dispatch(setMaxPuAreaSize(g.marxanMetadata.maxPuAreaSize));
        console.info('Shapefile uploaded', g);
      },
      onError: () => {
        setLoading(false);
        setSuccessFile(null);

        addToast('error-upload-shapefile', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Shapefile could not be uploaded</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
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

  return (
    <div className="mt-3 mb-5">
      {!!uploadingPlanningArea && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col w-full py-5 space-y-6 cursor-pointer">
            <div className="flex items-center space-x-2">
              <label className="px-3 py-1 bg-blue-100 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                <p className="text-sm text-primary-500">{successFile.name}</p>
              </label>
              <button
                id="cancel-shapefile-btn"
                type="button"
                className="flex items-center justify-center w-5 h-5 border border-white rounded-full group hover:bg-black"
                onClick={() => {
                  setSuccessFile(null);
                  resetPlanningArea(form);
                  // input.onChange(null);
                }}
              >
                <Icon
                  className="w-1.5 h-1.5 text-white group-hover:text-white"
                  icon={CLOSE_SVG}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!uploadingPlanningArea && (
        <Uploader
          caption="Upload shapefile"
          form={form}
          input={input}
          loading={loading}
          maxSize={maxSize}
          // handleSubmit={uploadPlanningAreaSubmit}
          reset={resetPlanningArea}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          successFile={successFile}
          setSuccessFile={setSuccessFile}
        />
      )}
    </div>
  );
};

export default PlanningAreUploader;
