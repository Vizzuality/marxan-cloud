import { ChangeEvent } from 'react';

import { MoreHorizontal } from 'lucide-react';

import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

type RowItem = {
  id: string;
  name: string;
  scenarios: number;
  tag: string;
};

const RowItem = ({
  item,
  visibleFeatures,
  selectedIds,
  onSelectRow,
  onToggleSeeOnMap,
  ActionsComponent,
}: {
  item: RowItem;
  visibleFeatures: string[];
  selectedIds: string[];
  onSelectRow: (evt: ChangeEvent<HTMLInputElement>) => void;
  onToggleSeeOnMap: (id: string) => void;
  ActionsComponent: ({ item }) => JSX.Element;
}) => {
  const { id, name, scenarios, tag } = item;
  const visibleOnMap = visibleFeatures.includes(id);

  return (
    <tr key={id} className="border-b border-gray-400">
      <td className="pb-2 pr-1 pt-5">
        <Checkbox
          id={`select-${id}`}
          theme="light"
          className="-mb-0.5 block h-4 w-4 checked:bg-blue-400"
          onChange={onSelectRow}
          value={id}
          checked={selectedIds.includes(id)}
        />
      </td>
      <td className="px-1 pb-2 pt-5">
        <div>{name}</div>
        <div className="mt-1.5 text-xs text-gray-300">
          Currently in use in {/* TODO Simao: Replace with <Tag /> component */}
          <span className="rounded bg-blue-500 bg-opacity-10 px-1 text-blue-500">
            {scenarios}
          </span>{' '}
          scenarios.
        </div>
      </td>
      <td className="px-6 pb-2 pt-5 text-xs">
        {tag && (
          <div className="flex justify-center">
            <span className="whitespace-nowrap rounded-full bg-yellow-600 bg-opacity-10 px-2 pb-1 pt-0.5 text-yellow-600">
              {tag}
            </span>
          </div>
        )}
      </td>
      <td className="pb-2 pl-1 pt-5">
        <div className="flex gap-6">
          <button type="button" onClick={() => onToggleSeeOnMap(id)}>
            <Icon
              className={cn({
                'h-5 w-5': true,
                'text-gray-400': !visibleOnMap,
                'text-blue-400': visibleOnMap,
              })}
              icon={visibleOnMap ? SHOW_SVG : HIDE_SVG}
            />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="h-5 w-5">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto rounded-2xl border-transparent p-0"
              side="bottom"
              sideOffset={5}
              align="start"
            >
              <ActionsComponent item={item} />
            </PopoverContent>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

export default RowItem;
