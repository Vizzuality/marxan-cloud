import { ComponentProps } from 'react';

import { ScaleControl } from 'react-map-gl';

import { cn } from 'utils/cn';

const MapScale = ({ className, ...props }: ComponentProps<typeof ScaleControl>): JSX.Element => (
  <ScaleControl
    {...props}
    className={cn({
      'absolute bottom-6 right-[305px]': true,
      [className]: !!className,
    })}
  />
);

export default MapScale;
