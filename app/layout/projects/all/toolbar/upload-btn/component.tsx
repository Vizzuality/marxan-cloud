import React, { useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setUploadMode, setLegacyProjectId } from 'store/slices/projects/new';

import { HiOutlineArrowUpOnSquareStack } from 'react-icons/hi2';

import { useCancelImportLegacyProject } from 'hooks/projects';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';
import { cn } from 'utils/cn';

import { UPLOAD_PROJECT_TYPES } from './constants';
import LegacyUploadModal from './legacy-upload-modal';
import UploadModal from './upload-modal';

export const ProjectsUploadBtn = (): JSX.Element => {
  const [modal, setModal] = useState(false);

  const dispatch = useAppDispatch();

  const { uploadMode, legacyProjectId } = useAppSelector((state) => state['/projects/new']);
  const cancelLegacyProjectMutation = useCancelImportLegacyProject({});

  const onCancelImportLegacyProject = useCallback(() => {
    cancelLegacyProjectMutation.mutate(
      { projectId: legacyProjectId },
      {
        onSuccess: ({ data: { projectId } }) => {
          dispatch(setLegacyProjectId(null));
          console.info('Import legacy project has been canceled', projectId);
        },
        onError: () => {
          console.error('Scenario not canceled');
        },
      }
    );
  }, [dispatch, legacyProjectId, cancelLegacyProjectMutation]);

  const onDismiss = useCallback(
    (notCancel) => {
      setModal(false);
      dispatch(setUploadMode(null));

      if (legacyProjectId && !notCancel) onCancelImportLegacyProject();
      dispatch(setLegacyProjectId(null));
    },
    [legacyProjectId, onCancelImportLegacyProject, dispatch]
  );

  const onSetUploadMode = useCallback(
    (id) => {
      dispatch(setUploadMode(id));
    },
    [dispatch]
  );

  return (
    <>
      <Button
        theme="secondary"
        size="base"
        onClick={() => {
          setModal(true);
        }}
        className="space-x-4"
      >
        <span>Upload project</span>
        <HiOutlineArrowUpOnSquareStack className="h-5 w-5" />
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
            <h2 className="font-heading text-2xl font-medium">Choose upload mode:</h2>
            <ul className="-mx-5 my-5 grid grid-cols-2 gap-10">
              {UPLOAD_PROJECT_TYPES.map((u) => {
                return (
                  <li
                    key={`${u.id}`}
                    className={cn({
                      'group cursor-pointer rounded-3xl border-2 border-transparent transition-all hover:border-gray-100 hover:shadow-2xl':
                        true,
                      'pointer-events-none opacity-25': u.disabled,
                    })}
                  >
                    <button type="button" onClick={() => onSetUploadMode(u.id)}>
                      <div className="h-full p-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 transition-all group-hover:bg-primary-500">
                          <Icon icon={u.icon} style={u.iconStyles} />
                        </div>

                        <div className="mt-8 text-left text-black">
                          <h3 className="font-heading text-lg font-medium">{u.title}</h3>
                          <h4 className="mt-5">{u.subtitle}</h4>
                        </div>

                        {u.disclaimer && (
                          <div className="mt-20 text-sm text-gray-400">{u.disclaimer}</div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {uploadMode === 'default' && <UploadModal onDismiss={onDismiss} />}
        {uploadMode === 'legacy' && <LegacyUploadModal onDismiss={onDismiss} />}
      </Modal>
    </>
  );
};

export default ProjectsUploadBtn;
