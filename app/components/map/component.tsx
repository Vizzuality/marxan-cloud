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
  /** A function that returns the map instance */
  children?: React.ReactNode;

  /** Custom css class for styling */
  className?: string;

  /** An object that defines the viewport
   * @see https://uber.github.io/react-map-gl/#/Documentation/api-reference/interactive-map?section=initialization
   */
  viewport?: ViewportProps;

  /** An object that defines the bounds */
  bounds?: {
    bbox: number[];
    options?: {};
    viewportOptions?: ViewportProps;
  };

  /** A function that exposes when the map is mounted.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapReady?: ({ map, mapContainer }) => void;

  /** A function that exposes when the map is loaded.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapLoad?: ({ map, mapContainer }) => void;

  /** A function that exposes the viewport */
  onMapViewportChange?: (viewport: ViewportProps) => void;
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
  onMapReady,
  onMapLoad,
  onMapViewportChange,
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
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /**
   * CALLBACKS
   */
  const handleLoad = () => {
    setLoaded(true);
    onMapLoad({ map: mapRef.current, mapContainer: mapContainerRef.current });
  };

  const handleViewportChange = (v) => {
    setViewport(v);
    onMapViewportChange(v);
  };

  const handleResize = (v) => {
    const newViewport = {
      ...mapViewport,
      ...v,
    };

    setViewport(newViewport);
    onMapViewportChange(newViewport);
  };

  const handleFitBounds = useCallback(
    (transitionDuration = 2500) => {
      if (!ready) return null;
      const { bbox, options, viewportOptions } = bounds;

      if (
        mapContainerRef.current.offsetWidth <= 0
        || mapContainerRef.current.offsetHeight <= 0
      ) {
        console.error("mapContainerRef doesn't have dimensions");
        return null;
      }

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
      onMapViewportChange(newViewport);

      return setTimeout(() => {
        setFlight(false);
      }, transitionDuration);
    },
    [ready, bounds, onMapViewportChange],
  );

  const handleGetCursor = useCallback(({ isHovering, isDragging }) => {
    if (isHovering) return 'pointer';
    if (isDragging) return 'grabbing';
    return 'grab';
  }, []);

  /**
   * EFFECTS
   */
  useEffect(() => {
    setReady(true);
    onMapReady({ map: mapRef.current, mapContainer: mapContainerRef.current });
  }, [onMapReady]);

  useEffect(() => {
    if (!isEmpty(bounds) && !!bounds.bbox && bounds.bbox.every((b) => !!b)) {
      handleFitBounds();
    }
  }, [bounds, handleFitBounds]);

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
        onViewportChange={handleViewportChange}
        onResize={handleResize}
        onLoad={handleLoad}
        getCursor={handleGetCursor}
        transitionInterpolator={new FlyToInterpolator()}
        transitionEasing={easeCubic}
      >
        {ready
          && loaded
          && !!mapRef.current
          && typeof children === 'function'
          && children(mapRef.current)}
      </ReactMapGL>
    </div>
  );
};

export default Map;
