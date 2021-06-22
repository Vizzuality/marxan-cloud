import React from 'react';
import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import HELP_2_SVG from 'svgs/ui/help-2.svg?sprite';

import { Step, TooltipRenderProps } from 'react-joyride';

interface HelpTooltipProps extends TooltipRenderProps {
  index: number;
  step: Step & {
    subtitle: string;
  },
}

export const HelpTooltip = ({
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: HelpTooltipProps) => {
  const { title, subtitle, content } = step;

  return (
    <div
      className="px-6 py-5 text-gray-500 bg-white rounded-3xl"
      {...tooltipProps}
    >
      <header className="flex items-center space-x-4">
        <div className="p-2.5 shadow-lg rounded-lg">
          <Icon icon={HELP_2_SVG} className="w-9 h-9" />
        </div>

        <div>
          <h3 className="text-xs tracking-wider uppercase font-heading">{title}</h3>
          <h4 className="text-sm">{subtitle}</h4>
        </div>

        <div className="flex pl-10 space-x-1">
          <button
            type="button"
            className={cx({
              'flex items-center justify-center bg-gray-100 rounded w-7 h-7 focus:outline-none': true,
              'opacity-50 cursor-default': index === 0,
              'hover:bg-primary-500': index !== 0,
            })}
            disabled={index === 0}
            {...backProps}
          >
            <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3" />
          </button>

          <button
            type="button"
            className="flex items-center justify-center bg-gray-100 rounded hover:bg-primary-500 w-7 h-7 focus:outline-none"
            {...primaryProps}
          >
            <Icon icon={ARROW_RIGHT_SVG} className="w-3 h-3" />
          </button>

        </div>
      </header>

      <div className="mt-5 text-sm text-gray-400" style={{ maxWidth: 330 }}>
        {content}
      </div>

      <div className="mt-5">
        <Button
          type="button"
          theme="secondary"
          size="s"
          {...skipProps}
        >
          Skip
        </Button>
      </div>
    </div>
  );
};

export default HelpTooltip;
