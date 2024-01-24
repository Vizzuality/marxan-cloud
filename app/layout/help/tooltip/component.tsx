import React, { ReactNode } from 'react';

import Icon from 'components/icon';

import HELP_2_SVG from 'svgs/ui/help-2.svg?sprite';

interface HelpTooltipProps {
  title: string;
  subtitle: string;
  content: ReactNode;
}

export const HelpTooltip = ({ title, subtitle, content }: HelpTooltipProps) => {
  return (
    <div
      className="rounded-3xl bg-white px-6 py-5 text-gray-600"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <header className="flex items-center space-x-4">
        <div className="rounded-lg p-2.5 shadow-lg">
          <Icon icon={HELP_2_SVG} className="h-9 w-9" />
        </div>

        <div>
          <h3 className="font-heading text-xs uppercase tracking-wider">{title}</h3>
          <h4 className="text-sm">{subtitle}</h4>
        </div>
      </header>

      <div className="mt-5 text-sm text-gray-600" style={{ maxWidth: 330 }}>
        {content}
      </div>
    </div>
  );
};

export default HelpTooltip;
