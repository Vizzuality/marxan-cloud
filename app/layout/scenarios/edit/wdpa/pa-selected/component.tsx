import React from 'react';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface ProtectedAreasSelectedProps {
  form?: any;
  options: Record<string, any>[];
  title: string;
  wdpaIucnCategories: Record<string, any>[];
}

export const ProtectedAreasSelected: React.FC<ProtectedAreasSelectedProps> = ({
  form,
  options,
  title,
  wdpaIucnCategories,
}: ProtectedAreasSelectedProps) => {
  return (
    <div className="mt-10">
      <h3 className="text-sm">{title}</h3>

      <div className="flex flex-wrap mt-2.5">
        {wdpaIucnCategories.map((w) => {
          const wdpa = options.find((o) => o.value === w);

          if (!wdpa) return null;

          return (
            <div
              key={`${wdpa.value}`}
              className="flex mb-2.5 mr-5"
            >
              <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                {
                  wdpa.label.length > 25
                    ? (`${(wdpa.label).substring(0, 25 - 3)}...`)
                    : wdpa.label
                }
              </span>

              <button
                aria-label="remove"
                type="button"
                className="flex items-center justify-center w-6 h-6 transition bg-transparent border border-gray-400 rounded-full hover:bg-gray-400"
                onClick={() => {
                  form.mutators.removeWDPAFilter(
                    wdpa.value,
                    wdpaIucnCategories,
                  );
                }}
              >
                <Icon icon={CLOSE_SVG} className="w-2.5 h-2.5" />
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProtectedAreasSelected;
