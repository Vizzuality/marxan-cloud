import React, { useEffect, useState, useRef, useCallback } from 'react';

import ReactMapGL, { FlyToInterpolator, TRANSITION_EVENTS } from 'react-map-gl';

import { fitBounds } from '@math.gl/web-mercator';
import { easeCubic } from 'd3-ease';
import isEmpty from 'lodash/isEmpty';
import { useDebouncedCallback } from 'use-debounce';

import { MapProps } from 'types/map';
import { cn } from 'utils/cn';

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
  onMapTilesLoaded,
  dragPan,
  dragRotate,
  scrollZoom,
  touchZoom,
  touchRotate,
  doubleClickZoom,
  screenshot,
  width = '100%',
  height = '100%',
  getCursor,
  ...mapboxProps
}: MapProps) => {
  /**
   * REFS
   */
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapTilesInterevalRef = useRef(null);

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
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  /**
   * CALLBACKS
   */
  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (onMapLoad) onMapLoad({ map: mapRef.current, mapContainer: mapContainerRef.current });
  }, [onMapLoad]);

  const debouncedOnMapViewportChange = useDebouncedCallback((v) => {
    if (onMapViewportChange) onMapViewportChange(v);
  }, 250);

  const handleViewportChange = useCallback(
    (v) => {
      setViewport(v);
      debouncedOnMapViewportChange(v);
    },
    [debouncedOnMapViewportChange]
  );

  const handleResize = useCallback(
    (v) => {
      const newViewport = {
        ...mapViewport,
        ...v,
      };

      setViewport(newViewport);
      debouncedOnMapViewportChange(newViewport);
    },
    [mapViewport, debouncedOnMapViewportChange]
  );

  const handleFitBounds = useCallback(() => {
    if (!ready) return null;
    const { bbox, options = {}, viewportOptions = {} } = bounds;
    const { transitionDuration = 0 } = viewportOptions;

    if (mapContainerRef.current.offsetWidth <= 0 || mapContainerRef.current.offsetHeight <= 0) {
      console.error("mapContainerRef doesn't have dimensions");
      return null;
    }

    const { longitude, latitude, zoom } = fitBounds({
      width: mapContainerRef.current.offsetWidth,
      height: mapContainerRef.current.offsetHeight,
      bounds: [
        [bbox[1], bbox[3]],
        [bbox[0], bbox[2]],
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
    debouncedOnMapViewportChange(newViewport);

    return setTimeout(() => {
      setFlight(false);
    }, +transitionDuration);
  }, [ready, bounds, debouncedOnMapViewportChange]);

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
    if (onMapReady) onMapReady({ map: mapRef.current, mapContainer: mapContainerRef.current });
  }, [onMapReady]);

  useEffect(() => {
    if (
      ready &&
      !isEmpty(bounds) &&
      !!bounds.bbox &&
      bounds.bbox.every((b) => typeof b === 'number')
    ) {
      handleFitBounds();
    }
  }, [ready, bounds, handleFitBounds]);

  useEffect(() => {
    if (loaded && ready) {
      mapTilesInterevalRef.current = setInterval(() => {
        setMapTilesLoaded(mapRef.current.areTilesLoaded());
      }, 250);
    }
  }, [ready, loaded]);

  useEffect(() => {
    setViewport((prevViewportState) => ({
      ...prevViewportState,
      ...viewport,
    }));
  }, [viewport]);

  useEffect(() => {
    if (mapContainerRef.current && screenshot) {
      mapContainerRef.current.querySelector('.mapboxgl-control-container').style.display = 'none';
    }
  }, [screenshot]);

  useEffect(() => {
    if (onMapTilesLoaded) {
      onMapTilesLoaded(mapTilesLoaded);
    }
  }, [mapTilesLoaded, onMapTilesLoaded]);

  useEffect(() => {
    return () => {
      if (mapTilesInterevalRef.current) {
        clearInterval(mapTilesInterevalRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className={cn({
        'relative z-0 h-full w-full': true,
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
        width={width}
        height={height}
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
        getCursor={getCursor || handleGetCursor}
        transitionInterpolator={new FlyToInterpolator()}
        transitionEasing={easeCubic}
        // attributionControl={false}
      >
        {ready &&
          loaded &&
          !!mapRef.current &&
          typeof children === 'function' &&
          children(mapRef.current)}
      </ReactMapGL>
    </div>
  );
};

export default Map;
