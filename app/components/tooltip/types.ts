import { ReactElement } from 'react';

import { TippyProps } from '@tippyjs/react/headless';

export interface TooltipProps extends TippyProps {
  contentClassName?: string;
  arrowClassName?: string;
  children: ReactElement;
  maxHeight?: number | string;
  popup?: boolean;
}
