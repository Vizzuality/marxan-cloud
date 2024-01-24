import { ViewportProps } from 'react-map-gl';

import { InteractiveMapProps } from 'react-map-gl/src/components/interactive-map';

export interface MapProps extends InteractiveMapProps {
  // /** A function that returns the map instance */
  children?: (map: any) => React.ReactNode;

  /** Custom css class for styling */
  className?: string;

  /** An object that defines the viewport
   * @see https://uber.github.io/react-map-gl/#/Documentation/api-reference/interactive-map?section=initialization
   */
  viewport?: Partial<ViewportProps>;

  /** An object that defines the bounds */
  bounds?: {
    bbox: number[];
    options?: {};
    viewportOptions?: Partial<ViewportProps>;
  };

  screenshot?: boolean;

  /** A function that exposes when the map is mounted.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapReady?: ({ map, mapContainer }) => void;

  /** A function that exposes when the map is loaded.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapLoad?: ({ map, mapContainer }) => void;

  /** A function that exposes the viewport */
  onMapViewportChange?: (viewport: Partial<ViewportProps>) => void;

  /** A function that exposes if current tiles on the viewport are loaded */
  onMapTilesLoaded?: (loaded: boolean) => void;
}
