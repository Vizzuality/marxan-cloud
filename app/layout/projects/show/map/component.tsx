import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/client';

import { useAdminPreviewLayer, useLegend, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import { ScenarioSidebarTabs } from 'layout/scenarios/show/sidebar/types';

import Select from 'components/forms/select';
import Map from 'components/map';
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeBasic from 'components/map/legend/types/basic';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import LegendTypeGradient from 'components/map/legend/types/gradient';
import LegendTypeMatrix from 'components/map/legend/types/matrix';

export interface ProjectMapProps {
}

export const ProjectMap: React.FC<ProjectMapProps> = () => {
  const [open, setOpen] = useState(false);
  const [selectedSid, setSelectedSid] = useState(null);
  const [session] = useSession();

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const {
    id, bbox, countryId, adminAreaLevel1Id, adminAreaLevel2Id,
  } = data;

  const {
    data: rawScenariosData,
    isFetched: rawScenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const sid = useMemo(() => {
    if (selectedSid) return selectedSid;

    return rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length ? `${rawScenariosData[0].id}` : null;
  }, [selectedSid, rawScenariosData, rawScenariosIsFetched]);

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length,
    sid,
    include: 'results',
    sublayers: selectedSid ? ['solutions'] : [],
    options: {
    },
  });

  const AdminPreviewLayer = useAdminPreviewLayer({
    active: (
      rawScenariosIsFetched && rawScenariosData && !rawScenariosData.length
      && (countryId || adminAreaLevel1Id || adminAreaLevel2Id)),
    country: countryId,
    region: adminAreaLevel1Id,
    subregion: adminAreaLevel2Id,
  });

  const LAYERS = [PUGridLayer, AdminPreviewLayer].filter((l) => !!l);

  const LEGEND = useLegend({
    type: selectedSid ? ScenarioSidebarTabs.SOLUTIONS : null,
    subtype: null,
    options: {},
  });

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

  useEffect(() => {
    setBounds({
      bbox,
      options: { padding: 50 },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [bbox]);

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

  const handleTransformRequest = (url) => {
    if (url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      };
    }

    return null;
  };

  return (
    <AnimatePresence>
      {id && rawScenariosIsFetched && (
        <motion.div
          key="project-map"
          className="relative w-full h-full col-span-5 overflow-hidden rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <HelpBeacon
            id="project-map"
            title="Map view"
            subtitle="Visualize all elements"
            content={(
              <div className="space-y-2">
                <p>
                  On this map you will be able to visualize all the
                  spatial components of the conservation plan.
                </p>
                <p>
                  You will
                  be able to visualize your planning region,
                  your features and, once you have run Marxan,
                  you will also be able to visualize the
                  results here.
                </p>
              </div>
            )}
            modifiers={['flip']}
            tooltipPlacement="left"
          >
            <div className="w-full h-full">
              <Map
                bounds={bounds}
                width="100%"
                height="100%"
                minZoom={minZoom}
                maxZoom={maxZoom}
                viewport={viewport}
                mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
                mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
                onMapViewportChange={handleViewportChange}
                transformRequest={handleTransformRequest}
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
          </HelpBeacon>

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

          {/* Legend */}
          <div className="absolute w-full max-w-xs bottom-10 right-2">
            <Legend
              open={open}
              className="w-full"
              maxHeight={300}
              onChangeOpen={() => setOpen(!open)}
            >
              {LEGEND.map((i) => {
                const { type, items, intersections } = i;

                return (
                  <LegendItem
                    sortable={false}
                    key={i.id}
                    {...i}
                  >
                    {type === 'matrix' && <LegendTypeMatrix className="pt-6 pb-4 text-sm text-white" intersections={intersections} items={items} />}
                    {type === 'basic' && <LegendTypeBasic className="text-sm text-gray-300" items={items} />}
                    {type === 'choropleth' && <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />}
                    {type === 'gradient' && <LegendTypeGradient className={{ box: 'text-sm text-gray-300' }} items={items} />}
                  </LegendItem>
                );
              })}
            </Legend>
          </div>

          {!!SCENARIOS_RUNNED.length && (
            <div className="absolute w-full max-w-xs top-10 left-2">
              <Select
                theme="dark"
                size="base"
                placeholder="Select scenario..."
                clearSelectionActive
                options={SCENARIOS_RUNNED}
                onChange={(s) => {
                  setSelectedSid(s);
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectMap;
