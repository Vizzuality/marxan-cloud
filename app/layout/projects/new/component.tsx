import React, { useState, useCallback } from 'react';
// import cx from 'classnames';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

// Layer manager
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

import Icon from 'components/icon';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import Button from 'components/button';

// Map
import Map from 'components/map';
import LAYERS from 'components/map/layers';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

import INFO_SVG from 'svgs/project/info.svg?sprite';
import UPLOAD_SHAPEFILE_SVG from 'svgs/project/upload-shapefile.svg?sprite';

import {
  composeValidators,
} from 'components/forms/validations';

import Wrapper from 'layout/wrapper';

import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import { NewProjectProps } from './types';

const NewProject: React.FC<NewProjectProps> = () => {
  const [hasPlanningArea, setHasPlanningArea] = useState(false);
  const minZoom = 2;
  const maxZoom = 10;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState({
    bbox: [
      10.5194091796875,
      43.6499881760459,
      10.9588623046875,
      44.01257086123085,
    ],
    options: {
      padding: 50,
    },
    viewportOptions: {
      transitionDuration: 0,
    },
  });

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  const handleZoomChange = useCallback(
    (zoom) => {
      setViewport({
        ...viewport,
        zoom,
        transitionDuration: 500,
      });
    },
    [viewport],
  );

  const handleFitBoundsChange = useCallback((b) => {
    setBounds(b);
  }, []);

  const handleSubmit = (values) => {
    console.info('values', values);
  };

  const handleCancel = () => {
    console.info('cancel');
  };

  return (
    <Wrapper>
      <div className="flex w-full h-full bg-gray-700 rounded-3xl">
        <div className="w-1/2 h-full">
          <FormRFF
            onSubmit={handleSubmit}
          >
            {(props) => (
              <form
                onSubmit={props.handleSubmit}
                autoComplete="off"
                className="justify-start w-full p-8"
              >
                <h1 className="max-w-xs text-white font-heading">
                  Name your project and define a planning area:
                </h1>

                {/* NAME */}
                <div className="mt-8">
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="name" {...fprops}>
                        <Label theme="dark" className="mb-3 uppercase">Project Name</Label>
                        <Input theme="dark" type="text" placeholder="Write project name..." />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-8">
                  <FieldRFF
                    name="description"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="description" {...fprops}>
                        <Label theme="dark" className="mb-3 uppercase">Description</Label>
                        <Textarea rows={4} placeholder="Write your project description..." />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <h2 className="mt-12 text-white font-heading">
                  Do you have a planning region shapefile?
                </h2>

                {/* PLANNING AREA */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center">
                    <h5 className="text-white uppercase text-xxs">Planning area</h5>
                    <button
                      className="w-5 h-5 ml-2"
                      type="button"
                      onClick={() => console.info('Planning Area info button click')}
                    >
                      <Icon icon={INFO_SVG} />
                    </button>
                  </div>
                  <div className="flex">
                    <Button
                      className="w-20 h-6 mr-4"
                      size="xs"
                      theme={!hasPlanningArea ? 'primary-white' : 'secondary'}
                      onClick={() => setHasPlanningArea(false)}
                    >
                      No
                    </Button>
                    <Button
                      className="w-20 h-6"
                      size="xs"
                      theme={hasPlanningArea ? 'primary-white' : 'secondary'}
                      onClick={() => setHasPlanningArea(true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                {!hasPlanningArea && <PlanningUnitGrid unit={null} />}
                {hasPlanningArea && (
                  <Button
                    className="flex w-full mt-4"
                    theme="secondary"
                    size="base"
                    onClick={() => console.info('Upload shapefile')}
                  >
                    <span className="w-full">
                      Upload shapefile
                    </span>
                    <Icon
                      icon={UPLOAD_SHAPEFILE_SVG}
                    />
                  </Button>
                )}

                {/* BUTTON BAR */}
                <div className="flex mt-8">
                  <Button
                    theme="secondary"
                    size="xl"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="ml-6"
                    theme="primary"
                    size="xl"
                    type="submit"
                    disabled
                  >
                    Save
                  </Button>
                </div>
              </form>
            )}
          </FormRFF>
        </div>
        <div className="relative flex items-center justify-center w-1/2 h-full text-white">
          <Map
            className=""
            width="100%"
            height="100%"
            bounds={bounds}
            minZoom={minZoom}
            maxZoom={maxZoom}
            viewport={viewport}
            mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v9"
            onMapViewportChange={handleViewportChange}
            onMapReady={() => console.info('Map ready!')}
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
            <Controls>
              <ZoomControl
                viewport={{
                  ...viewport,
                  minZoom,
                  maxZoom,
                }}
                onZoomChange={handleZoomChange}
              />

              <FitBoundsControl
                bounds={{
                  ...bounds,
                  viewportOptions: {
                    transitionDuration: 1500,
                  },
                }}
                onFitBoundsChange={handleFitBoundsChange}
              />
            </Controls>
          </Map>
        </div>
      </div>
    </Wrapper>
  );
};

export default NewProject;
