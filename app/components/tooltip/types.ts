import { ReactElement } from 'react';

import { TippyProps } from '@tippyjs/react/headless';

export interface TooltipProps extends TippyProps {
  arrowClassName?: string,
  children: ReactElement;
  maxHeight?: number | string;
}
