import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { setUploadMode, setLegacyProjectId } from 'store/slices/projects/new';

import cx from 'classnames';

import { useCancelImportLegacyProject } from 'hooks/projects';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

import { UPLOAD_PROJECT_TYPES } from './constants';
import LegacyUploadModal from './legacy-upload-modal';
import UploadModal from './upload-modal';

export interface ProjectsUploadBtnProps {

}

export const ProjectsUploadBtn: React.FC<ProjectsUploadBtnProps> = () => {
  const [modal, setModal] = useState(false);

  const dispatch = useDispatch();
  const { uploadMode, legacyProjectId, importSubmit } = useSelector((state) => state['/projects/new']);
  const cancelLegacyProjectMutation = useCancelImportLegacyProject({});

  const onCancelImportLegacyProject = useCallback(() => {
    cancelLegacyProjectMutation.mutate({ projectId: legacyProjectId }, {
      onSuccess: ({ data: { projectId } }) => {
        dispatch(setLegacyProjectId(null));
        console.info('Import legacy project has been canceled', projectId);
      },
      onError: () => {
        console.error('Scenario not canceled');
      },
    });
  }, [dispatch, legacyProjectId, cancelLegacyProjectMutation]);

  const onDismiss = () => {
    setModal(false);
    dispatch(setUploadMode(null));
    if (legacyProjectId && !importSubmit) onCancelImportLegacyProject();
  };

  const onSetUploadMode = useCallback((id) => {
    dispatch(setUploadMode(id));
  }, [dispatch]);

  return (
    <>
      <Button
        theme="secondary"
        size="base"
        onClick={() => {
          setModal(true);
        }}
      >
        <span>Upload project</span>
        <Icon className="w-3 h-3 ml-4" icon={UPLOAD_SVG} />
      </Button>

      <Modal
        id="publish-project-modal"
        dismissable
        open={modal}
        size="narrow"
        title="Publish to community"
        onDismiss={onDismiss}
      >
        {!uploadMode && (
          <div className="px-10 py-5 text-gray-500">
            <h2 className="text-2xl font-medium font-heading">Choose upload mode:</h2>
            <ul className="grid grid-cols-2 gap-10 my-5 -mx-5">
              {UPLOAD_PROJECT_TYPES.map((u) => {
                return (
                  <li
                    key={`${u.id}`}
                    className={cx({
                      'transition-all border-2 border-transparent cursor-pointer group hover:shadow-2xl rounded-3xl hover:border-gray-100': true,
                      'pointer-events-none opacity-25': u.disabled,
                    })}
                  >
                    <button type="button" onClick={() => onSetUploadMode(u.id)}>
                      <div className="h-full p-5">
                        <div className="flex items-center justify-center w-16 h-16 transition-all bg-gray-100 rounded-3xl group-hover:bg-primary-500">
                          <Icon icon={u.icon} style={u.iconStyles} />
                        </div>

                        <div className="mt-8 text-black">
                          <h3 className="text-lg font-medium font-heading">{u.title}</h3>
                          <h4 className="mt-5">{u.subtitle}</h4>
                        </div>

                        {u.disclaimer && (
                          <div className="mt-20 text-sm text-gray-400">
                            {u.disclaimer}
                          </div>
                        )}
                      </div>

                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {uploadMode === 'default' && (
          <UploadModal
            onDismiss={onDismiss}
          />
        )}

        {uploadMode === 'legacy' && (
          <LegacyUploadModal onDismiss={onDismiss} />
        )}
      </Modal>
    </>

  );
};

export default ProjectsUploadBtn;
