import { ComponentProps, useCallback, useRef, useState } from 'react';

import { Form as FormRFF, FormProps, Field } from 'react-final-form';

import { useRouter } from 'next/router';

import { useAppDispatch } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { sortBy } from 'lodash';
import { HiOutlineArrowUpOnSquareStack } from 'react-icons/hi2';
import { useEffectOnceWhen } from 'rooks';

import { useProjectCostSurfaces } from 'hooks/cost-surface';
import { useCanEditScenario } from 'hooks/permissions';
import { useDownloadShapefileTemplate } from 'hooks/projects';
import {
  useLinkScenarioToCostSurface,
  useUnlinkScenarioToCostSurface,
  useScenario,
} from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import CostSurfaceUploadModal from 'layout/project/sidebar/project/inventory-panel/cost-surfaces/modals/upload';
import Section from 'layout/section';
import { Scenario } from 'types/api/scenario';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export type FormFields = {
  costSurfaceId: Scenario['costSurface']['id'];
};

export const GridSetupCostSurface = (): JSX.Element => {
  const [opened, setOpened] = useState(false);
  const [successFile, setSuccessFile] = useState<{ name: string }>(null);
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const formRef = useRef<FormProps<FormFields>['form']>(null);
  const dispatch = useAppDispatch();
  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedCostSurface, setLayerSettings } = scenarioSlice.actions;

  const { addToast } = useToasts();

  const editable = useCanEditScenario(pid, sid);
  const costSurfaceQuery = useProjectCostSurfaces(
    pid,
    {},
    {
      select: (data) =>
        sortBy(data, 'name')?.map(({ id, name, isDefault }) => ({
          value: id,
          label: name,
          isDefault,
        })),
    }
  );
  const scenarioQuery = useScenario(sid, {
    include: 'costSurface',
  });
  const linkScenarioMutation = useLinkScenarioToCostSurface();
  const unlinkScenarioMutation = useUnlinkScenarioToCostSurface();

  const downloadShapefileTemplateMutation = useDownloadShapefileTemplate();

  const onDownload = useCallback(() => {
    downloadShapefileTemplateMutation.mutate(
      { pid },
      {
        onError: () => {
          addToast(
            'download-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <ul className="text-sm">Template not downloaded</ul>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, downloadShapefileTemplateMutation, addToast]);

  const cancelCostSurfaceUpload = useCallback(() => {
    setSuccessFile(null);
  }, []);

  const defaultCostSurface = costSurfaceQuery.data?.find(({ isDefault }) => isDefault);

  const onChangeCostSurface = useCallback(
    (value: string) => {
      formRef.current.change('costSurfaceId', value);

      dispatch(setSelectedCostSurface(value ?? defaultCostSurface?.value));
      dispatch(
        setLayerSettings({
          id: value ?? defaultCostSurface?.value,
          settings: {
            visibility: true,
          },
        })
      );
    },
    [dispatch, setSelectedCostSurface, setLayerSettings, defaultCostSurface]
  );

  const handleCostSurfaceChange = useCallback(
    (data: Parameters<ComponentProps<typeof FormRFF<FormFields>>['onSubmit']>[0]) => {
      if (!data.costSurfaceId) {
        return unlinkScenarioMutation.mutate(
          { sid },
          {
            onSuccess: () => {
              dispatch(setSelectedCostSurface(defaultCostSurface?.value));
              dispatch(
                setLayerSettings({
                  id: defaultCostSurface?.value,
                  settings: {
                    visibility: true,
                  },
                })
              );

              addToast(
                'scenario-cost-surface-unlink-success',
                <>
                  <h2 className="font-medium">Cost surface applied successfully</h2>
                </>,
                {
                  level: 'success',
                }
              );
            },
            onError: () => {
              addToast(
                'scenario-cost-surface-error',
                <>
                  <h2 className="font-medium">Something went wrong</h2>
                  <ul className="text-sm">Cost surface could not be unlinke.</ul>
                </>,
                {
                  level: 'error',
                }
              );
            },
          }
        );
      }

      linkScenarioMutation.mutate(
        { sid, csid: data.costSurfaceId },
        {
          onSuccess: () => {
            dispatch(setSelectedCostSurface(data.costSurfaceId));
            dispatch(
              setLayerSettings({
                id: data.costSurfaceId,
                settings: {
                  visibility: true,
                },
              })
            );

            addToast(
              'scenario-cost-surface-success',
              <>
                <h2 className="font-medium">Cost surface applied successfully</h2>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'scenario-cost-surface-error',
              <>
                <h2 className="font-medium">Something went wrong</h2>
                <ul className="text-sm">Cost surface could not be updated</ul>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [
      linkScenarioMutation,
      unlinkScenarioMutation,
      sid,
      addToast,
      dispatch,
      setSelectedCostSurface,
      setLayerSettings,
      defaultCostSurface,
    ]
  );

  useEffectOnceWhen(() => {
    const costSurfaceId = scenarioQuery.data.costSurface.id;

    dispatch(setSelectedCostSurface(costSurfaceId));
    dispatch(
      setLayerSettings({
        id: costSurfaceId,
        settings: {
          visibility: true,
        },
      })
    );
  }, Boolean(scenarioQuery.data?.id));

  return (
    <motion.div
      key="cost-surface"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-500">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Cost surface</h3>
            <InfoButton theme="primary" className="bg-gray-400">
              <div>
                <h4 className="mb-2.5 font-heading text-lg">What is a Cost Surface?</h4>
                <div className="space-y-2">
                  <p>
                    Marxan aims to minimize socio-economic impacts and conflicts between uses
                    through what is called the “cost” surface. In conservation planning, cost data
                    may reflect acquisition, management, or opportunity costs ($), but may also
                    reflect non-monetary impacts. Proxies are commonly used in absence of fine-scale
                    socio-economic information. A default value for cost will be the planning unit
                    area but you can upload your cost surface.
                  </p>
                  <p>
                    In the examples below, we illustrate how distance from a city, road or port can
                    be used as a proxy cost surface. In these examples, areas with many competing
                    activities will make a planning unit cost more than areas further away with less
                    competition for access.
                  </p>
                  <img src={COST_SEA_IMG} alt="Cost sea" />
                  <img src={COST_LAND_IMG} alt="Cost Land" />
                </div>
              </div>
            </InfoButton>
          </div>
        </div>

        <FormRFF<FormFields>
          onSubmit={handleCostSurfaceChange}
          initialValues={{
            costSurfaceId: scenarioQuery.data?.costSurface?.id || null,
          }}
          keepDirtyOnReinitialize
        >
          {(fprops) => {
            formRef.current = fprops.form;

            return (
              <form
                id="form-cost-surface-scenario"
                onSubmit={fprops.handleSubmit}
                autoComplete="off"
                className="space-y-3"
              >
                <Field name="costSurfaceId">
                  {() => (
                    <Select
                      maxHeight={300}
                      size="base"
                      theme="dark"
                      selected={fprops.values.costSurfaceId}
                      options={costSurfaceQuery.data?.filter(({ isDefault }) => !isDefault)}
                      clearSelectionActive
                      onChange={onChangeCostSurface}
                      clearSelectionLabel="Default cost surface"
                    />
                  )}
                </Field>
                <Button
                  type="submit"
                  theme="primary-alt"
                  size="base"
                  className="w-full"
                  disabled={!fprops.dirty}
                >
                  Apply cost surface
                </Button>
              </form>
            );
          }}
        </FormRFF>

        <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden text-sm">
          <p className="mt-2 text-xs">
            By default all projects have an equal area cost surface which means that planning units
            with the same area have the same cost
          </p>

          <div className="pt-5">
            <h4 className="mb-2">
              {editable && '1. '}
              Download cost template
            </h4>
            <Button theme="primary-alt" size="base" className="w-full" onClick={onDownload}>
              Download cost surface template
            </Button>
          </div>

          <div className="pt-5">
            {editable && <h4 className="mb-2">2. Upload cost template</h4>}
            {!editable && successFile && <h4 className="mb-2">Uploaded cost template</h4>}

            {editable && (
              <div className="mb-5 mt-3">
                {!successFile && (
                  <Button
                    className="dropzone w-full cursor-pointer py-1 hover:bg-gray-600"
                    theme="secondary"
                    size="base"
                    onClick={() => setOpened(true)}
                  >
                    Upload cost surface
                    <HiOutlineArrowUpOnSquareStack className="absolute right-6 h-5 w-5 text-white" />
                  </Button>
                )}

                {successFile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex w-full cursor-pointer flex-col space-y-6">
                      <div className="flex items-center space-x-2">
                        <label
                          className="rounded-3xl bg-blue-200 bg-opacity-10 px-3 py-1"
                          htmlFor="cancel-shapefile-btn"
                        >
                          <p className="text-sm text-primary-500">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="group flex h-5 w-5 items-center justify-center rounded-full border border-white hover:bg-black"
                          onClick={cancelCostSurfaceUpload}
                        >
                          {editable && (
                            <Icon
                              className="w-4.5 h-1.5 text-white group-hover:text-white"
                              icon={CLOSE_SVG}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <CostSurfaceUploadModal onDismiss={() => setOpened(false)} isOpen={opened} />
              </div>
            )}
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default GridSetupCostSurface;
