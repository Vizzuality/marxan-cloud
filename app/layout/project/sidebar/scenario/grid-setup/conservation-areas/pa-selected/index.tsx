import React from 'react';

import { useRouter } from 'next/router';

import { useCanEditScenario } from 'hooks/permissions';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface ProtectedAreasSelectedProps {
  form?: any;
  options: Record<string, any>[];
  title: string;
  isView?: boolean;
  wdpaIucnCategories: Record<string, any>[];
}

export const ProtectedAreasSelected: React.FC<ProtectedAreasSelectedProps> = ({
  form,
  options,
  title,
  isView = false,
  wdpaIucnCategories,
}: ProtectedAreasSelectedProps) => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const editable = useCanEditScenario(pid, sid);

  return (
    <div className="mt-10">
      <h3 className="text-sm">{title}</h3>
      <div className="mt-2.5 flex flex-wrap">
        {wdpaIucnCategories.map((w) => {
          const wdpa = options.find((o) => o.value === w);

          if (!wdpa) return null;

          return (
            <div key={`${wdpa.value}`} className="mb-2.5 mr-5 flex">
              <span className="mr-1 inline-flex h-6 items-center rounded-3xl bg-blue-500 bg-opacity-20 px-2.5 text-sm text-blue-500">
                {wdpa.label.length > 25 ? `${wdpa.label.substring(0, 25 - 3)}...` : wdpa.label}
              </span>

              {!isView && editable && (
                <button
                  aria-label="remove"
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-transparent transition hover:bg-gray-600"
                  onClick={() => {
                    form.mutators.removeWDPAFilter(wdpa.value, wdpaIucnCategories);
                  }}
                >
                  <Icon icon={CLOSE_SVG} className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProtectedAreasSelected;
