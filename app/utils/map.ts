import { Point } from 'mapbox-gl';

import { SIDEBAR_WIDTH } from 'layout/project/sidebar/constants';

export const centerMap = ({
  ref,
  isSidebarOpen,
}: {
  ref: mapboxgl.Map;
  isSidebarOpen: boolean;
}) => {
  if (ref) {
    const { lat, lng } = ref?.getCenter();
    const { x, y } = ref?.project([lng, lat]);
    const sidebarX = isSidebarOpen ? -SIDEBAR_WIDTH / 2 : SIDEBAR_WIDTH / 2;
    const centerPoint = new Point(x + sidebarX, y);
    const latLng = ref?.unproject(centerPoint);
    ref?.flyTo({ center: latLng });
  }
};
