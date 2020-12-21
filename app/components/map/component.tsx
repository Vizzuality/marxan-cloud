import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import cx from 'classnames';

import isEmpty from 'lodash/isEmpty';

import ReactMapGL, {
  FlyToInterpolator,
  TRANSITION_EVENTS,
  ViewportProps,
  InteractiveMapProps,
} from 'react-map-gl';
import { fitBounds } from '@math.gl/web-mercator';

import { easeCubic } from 'd3-ease';

export interface MapProps extends InteractiveMapProps {
  /** Mapbox Api Access Token */
  mapboxApiAccessToken: string;

  /** A function that returns the map instance */
  children: React.ReactNode;

  /** Custom css class for styling */
  className?: string;

  /** An object that defines the viewport
   * @see https://uber.github.io/react-map-gl/#/Documentation/api-reference/interactive-map?section=initialization
   */
  viewport?: ViewportProps;

  /** An object that defines the bounds */
  bounds: {
    bbox: number[];
    options: {};
    viewportOptions: ViewportProps;
  };
  /** A boolean that allows panning */
  dragPan: boolean;

  /** A boolean that allows rotating */
  dragRotate: boolean;

  /** A boolean that allows zooming */
  scrollZoom: boolean;

  /** A boolean that allows zooming */
  touchZoom: boolean;

  /** A boolean that allows touch rotating */
  touchRotate: boolean;

  /** A boolean that allows double click zooming */
  doubleClickZoom: boolean;

  /** A function that exposes when the map is ready.
   * It returns and object with the `this.map` and `this.mapContainerRef` reference. */
  onReady: (values) => void;

  /** A function that exposes when the map is loaded.
   * It returns and object with the `this.map` and `this.mapContainerRef` reference. */
  onLoad: (values) => void;

  /** A function that exposes the viewport */
  onViewportChange: (viewport: ViewportProps) => void;
}

const DEFAULT_VIEWPORT = {
  zoom: 2,
  latitude: 0,
  longitude: 0,
};

export const Map = ({
  mapboxApiAccessToken,
  children,
  className,
  viewport,
  bounds,
  onReady,
  onLoad,
  onViewportChange,
  dragPan,
  dragRotate,
  scrollZoom,
  touchZoom,
  touchRotate,
  doubleClickZoom,
  ...mapboxProps
}: MapProps) => {
  /**
   * REFS
   */
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  /**
   * STATE
   */
  const [mapViewport, setViewport] = useState({
    ...DEFAULT_VIEWPORT,
    ...viewport,
  });
  const [flying, setFlight] = useState(false);
  const [loaded, setLoader] = useState(false);

  /**
   * CALLBACKS
   */
  const onMapLoad = () => {
    setLoader(true);
    onLoad({ map: mapRef.current, mapContainer: mapContainerRef.current });
  };

  const onMapViewportChange = (v) => {
    setViewport(v);
    onViewportChange(v);
  };

  const onMapResize = (v) => {
    const newViewport = {
      ...mapViewport,
      ...v,
    };

    setViewport(newViewport);
    onViewportChange(newViewport);
  };

  const onMapFitBounds = useCallback(
    (transitionDuration = 2500) => {
      const { bbox, options, viewportOptions } = bounds;

      const { longitude, latitude, zoom } = fitBounds({
        width: mapContainerRef.current.offsetWidth,
        height: mapContainerRef.current.offsetHeight,
        bounds: [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        ...options,
      });

      const newViewport = {
        longitude,
        latitude,
        zoom,
        transitionDuration,
        transitionInterruption: TRANSITION_EVENTS.UPDATE,
        ...viewportOptions,
      };

      setFlight(true);
      setViewport((prevViewport) => ({
        ...prevViewport,
        ...newViewport,
      }));
      onViewportChange(newViewport);

      setTimeout(() => {
        setFlight(false);
      }, transitionDuration);
    },
    [bounds, onViewportChange],
  );

  /**
   * EFFECTS
   */
  useEffect(() => {
    onReady({ map: mapRef, mapContainer: mapContainerRef });
  }, [onReady]);

  useEffect(() => {
    if (!isEmpty(bounds) && !!bounds.bbox && bounds.bbox.every((b) => !!b)) {
      onMapFitBounds();
    }
  }, [bounds, onMapFitBounds]);

  useEffect(() => {
    setViewport((prevViewportState) => ({
      ...prevViewportState,
      ...viewport,
    }));
  }, [viewport]);

  return (
    <div
      ref={mapContainerRef}
      className={cx({
        'relative w-full h-full z-0': true,
        [className]: !!className,
      })}
    >
      <ReactMapGL
        ref={(_map) => {
          if (_map) {
            mapRef.current = _map.getMap();
          }
        }}
        mapboxApiAccessToken={mapboxApiAccessToken}
        // CUSTOM PROPS FROM REACT MAPBOX API
        {...mapboxProps}
        // VIEWPORT
        {...mapViewport}
        width="100%"
        height="100%"
        // INTERACTIVITY
        dragPan={!flying && dragPan}
        dragRotate={!flying && dragRotate}
        scrollZoom={!flying && scrollZoom}
        touchZoom={!flying && touchZoom}
        touchRotate={!flying && touchRotate}
        doubleClickZoom={!flying && doubleClickZoom}
        // DEFAULT FUNC IMPLEMENTATIONS
        onViewportChange={onMapViewportChange}
        onResize={onMapResize}
        onLoad={onMapLoad}
        // getCursor={getCursor}
        transitionInterpolator={new FlyToInterpolator()}
        transitionEasing={easeCubic}
      >
        {loaded
          && !!mapRef.current
          && typeof children === 'function'
          && children(mapRef.current)}
      </ReactMapGL>
    </div>
  );
};

export default Map;
