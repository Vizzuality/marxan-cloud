import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { Form as FormRFF, Field as FieldRFF, FormSpy } from 'react-final-form';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import validate from 'validate.js';

import { useAccessToken } from 'hooks/auth';
import { usePUGridLayer } from 'hooks/map';
import { useOwnsProject } from 'hooks/permissions';
import { useProjectsUsers, useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import Textarea from 'components/forms/textarea';
import { arrayValidator, composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import Map from 'components/map';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

const resourcesValidator = (value) => {
  if (!value) return 'Error';

  if (value.length === 0) return undefined;

  const validContent = value
    .map((resource) => {
      const title = validate.single(resource.title, { presence: true });
      const url = validate.single(resource.url, { presence: true, url: true });

      if (!title && !url) return false;

      return {
        id: resource.id,
        title,
        url,
      };
    })
    .filter((validation) => validation);

  if (validContent.length) return validContent;

  return undefined;
};

export interface PublishProjectModalProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const PublishProjectModal: React.FC<PublishProjectModalProps> = ({
  onSubmit,
  onCancel,
}: PublishProjectModalProps) => {
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);
  const [tmpValues, setTmpValues] = useState<Record<string, any>>({});

  const accessToken = useAccessToken();

  const { query } = useRouter();
  const { pid } = query;

  const { data: projectData } = useProject(pid);
  const { bbox, isPublic } = projectData;

  const { data: projectsUsersData } = useProjectsUsers([pid]);

  const { data: projectUsersData } = useProjectUsers(pid);
  const PROJECT_CREATORS = useMemo(() => {
    if (!projectUsersData) {
      return [];
    }

    return projectUsersData
      .filter((user) => user.roleName === 'project_owner' || user.roleName === 'project_contributor')
      .map((user) => {
        return {
          roleName: user.roleName,
          ...user.user,
        };
      });
  }, [projectUsersData]);

  const isOwner = useOwnsProject(pid);

  const {
    data: rawScenariosData,
    isFetched: rawScenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const INITIAL_VALUES = useMemo(() => {
    return {
      name: projectData?.name || '',
      description: projectData?.description || '',
      creators: PROJECT_CREATORS,
      resources: [],
      scenarioId: null,
    };
  }, [projectData, PROJECT_CREATORS]);

  const SCENARIOS_RUNNED = useMemo(() => {
    return rawScenariosData
      .map((s) => {
        if (s.jobs.find((j) => j.kind === 'run' && j.status === 'done')) {
          return {
            label: s.name,
            value: s.id,
          };
        }

        return null;
      })
      .filter((s) => !!s);
  }, [rawScenariosData]);

  const { scenarioId } = tmpValues;

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length,
    sid: scenarioId,
    include: 'results',
    sublayers: [
      ...(scenarioId) ? ['frequency'] : [],
    ],
    options: {
      settings: {
      },
    },
  });

  const LAYERS = [
    PUGridLayer,
  ].filter((l) => !!l);

  useEffect(() => {
    setBounds({
      bbox,
      options: { padding: 10 },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [bbox]);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  const handleTransformRequest = (url) => {
    if (url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
    return null;
  };

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col justify-between flex-grow w-full px-6 overflow-auto"
        >
          <FormSpy onChange={({ values: spyValues }) => setTmpValues(spyValues)} />
          <h1 className="mb-5 text-xl font-medium text-black">
            Publish project to the community
          </h1>

          <div className="mt-8">
            <FieldRFF
              name="name"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="name" {...fprops}>
                  <div className="flex items-center mb-3 space-x-2">
                    <Label theme="light" className="uppercase" id="name">
                      Project Name
                    </Label>
                  </div>
                  <Input theme="light" type="text" placeholder="Write project name..." />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-8">
            <FieldRFF
              name="description"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="description" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Description</Label>
                  <Textarea
                    theme="light"
                    rows={4}
                    placeholder="Write your project description..."
                  />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-8">
            <FieldRFF
              name="creators"
              validate={composeValidators([arrayValidator])}
            >
              {(fprops) => (
                <Field id="creators" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Creators</Label>
                  {PROJECT_CREATORS.map((user) => (
                    <div key={user.id} className="flex items-center mb-3 space-x-2">
                      <div className="flex items-center">
                        <Avatar
                          className="mr-2 text-sm uppercase border bg-primary-700"
                          size="s"
                          bgImage={user.avatarDataUrl}
                          bgColor={projectsUsersData[user.id]}
                        >
                          {!user.avatarDataUrl && (user.displayName || '').slice(0, 2)}
                        </Avatar>
                        <div>
                          <span className="text-gray-700">{user.displayName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-8">
            <FieldRFF
              name="resources"
              validate={composeValidators([resourcesValidator])}
            >
              {(fprops) => {
                const { error } = fprops.meta;

                return (
                  <div>
                    <Label theme="light" className="mb-3 uppercase">Resources</Label>

                    <div className="flex flex-col space-y-5">
                      {values.resources.map((resource, i) => {
                        const err = error && error[0].find((e) => e.id === resource.id);

                        return (
                          <div key={resource.id} className="flex items-center justify-between space-x-2">
                            <div className="w-full">
                              <Label id={`resource-${i}-title`} theme="light" className="mb-3 uppercase">Title</Label>
                              <Input
                                id={`resource-${i}-title`}
                                name={`resource-${i}-url`}
                                theme="light"
                                type="text"
                                status={err?.title ? 'error' : 'valid'}
                                onChange={(e) => {
                                  const resources = [...values.resources];
                                  resources[i].title = e.target.value || null;

                                  fprops.input.onChange(
                                    resources,
                                  );
                                }}
                              />
                            </div>
                            <div className="w-full">
                              <Label id={`resource-${i}-url`} theme="light" className="mb-3 uppercase">Url</Label>
                              <Input
                                id={`resource-${i}-url`}
                                name={`resource-${i}-url`}
                                theme="light"
                                type="text"
                                status={err?.url ? 'error' : 'valid'}
                                onChange={(e) => {
                                  const resources = [...values.resources];
                                  resources[i].url = e.target.value || null;

                                  fprops.input.onChange(
                                    resources,
                                  );
                                }}
                              />
                            </div>

                            <div className="relative w-8 h-8 flex-shrink-0 top-3.5">
                              <Button
                                size="xs"
                                theme="danger"
                                className="w-full h-full"
                                onClick={() => {
                                  const resources = [...values.resources];
                                  resources.splice(i, 1);

                                  fprops.input.onChange(
                                    resources,
                                  );
                                }}
                              >
                                <Icon icon={CLOSE_SVG} className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                          </div>
                        );
                      })}

                      <Button
                        theme="secondary"
                        size="base"
                        className="w-full"
                        onClick={() => {
                          const { valid } = fprops.meta;

                          if (valid || !values.resources.length) {
                            fprops.input.onChange([
                              ...values.resources,
                              {
                                id: Date.now(),
                                title: null,
                                url: null,
                              },
                            ]);
                          }
                        }}
                      >
                        Add resources
                      </Button>
                    </div>

                  </div>
                );
              }}
            </FieldRFF>
          </div>

          <div className="mt-8">
            <FieldRFF
              name="scenarioId"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <div>
                  <Label id="scenarioId" theme="light" className="mb-3 uppercase">Scenario thumbnail</Label>
                  <div className="flex items-start justify-between space-x-5">
                    <Field id="scenarioId" {...fprops} className="w-full">
                      <Select
                        theme="light"
                        size="base"
                        placeholder="Select..."
                          // selected={values.scenarioId}
                        options={SCENARIOS_RUNNED}
                        onChange={fprops.input.onChange}
                      />
                    </Field>
                    <div className="flex-shrink-0 overflow-hidden h-44 w-44 rounded-3xl">
                      <Map
                        bounds={bounds}
                        scrollZoom={false}
                        touchZoom={false}
                        dragPan={false}
                        dragRotate={false}
                        touchRotate={false}
                        screenshot
                        viewport={viewport}
                        onViewportChange={handleViewportChange}
                        width="100%"
                        height="100%"
                        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
                        mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
                        transformRequest={handleTransformRequest}
                        onClick={(e) => {
                          if (e && e.features) {
                            console.info(e.features);
                          }
                        }}
                      >
                        {(map) => {
                          return (
                            <LayerManager map={map} plugin={PluginMapboxGl}>
                              {LAYERS.map((l) => (
                                <Layer key={l.id} {...l} />
                              ))}
                            </LayerManager>
                          );
                        }}

                      </Map>
                    </div>
                  </div>
                </div>

              )}
            </FieldRFF>
          </div>

          <div
            className="flex justify-center mx-auto mt-4 pt-3.5 space-x-4 sticky bottom-0 bg-white w-full"
            style={{
              boxShadow: '0 0 0 3px #FFF',
            }}
          >
            <div className="absolute left-0 z-10 w-full h-4 pointer-events-none bottom-full bg-gradient-to-t from-white via-white" />
            <Button
              theme="tertiary"
              size="lg"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              disabled={isPublic || !isOwner}
              theme="primary"
              size="lg"
              type="submit"
            >
              Publish
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default PublishProjectModal;
