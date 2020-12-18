import React from 'react';
import cx from 'classnames';

import Avatar from 'components/avatar';
import Button from 'components/button';

export interface ItemProps {
  className: string;
  name: string;
  area: string;
  description: string;
  lastUpdate: string;
  contributors: Record<string, unknown>[];
  onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
  onDuplicate: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  area,
  description,
  lastUpdate,
  contributors = [],
  onDownload,
  onDuplicate,
  onDelete,
}: ItemProps) => (
  <div
    className={cx({
      'flex-column rounded bg-gray-700 p-8 text-white': true,
      [className]: !!className,
    })}
  >
    <header className="flex-1">
      <h3 className="text-xs uppercase">{area}</h3>
      <h2 className="mt-2 text-3xl mb-7">{name}</h2>
      <div className="mb-3 text-sm">
        <span>Last scenario creation:</span>
        <span className="ml-2 text-primary-500">
          {lastUpdate || 'no scenario'}
        </span>
      </div>
      <div className="text-sm opacity-50">{description}</div>
    </header>

    <footer className="mt-7">
      {!!contributors.length && (
        <div className="flex items-center text-sm mb-7">
          <p>Contributors:</p>
          <ul className="flex ml-5">
            {contributors.map((c, i) => {
              return (
                <li
                  key={`${c.id}`}
                  className={cx({
                    '-ml-3': i !== 0,
                  })}
                >
                  <Avatar bgImage="/images/avatar.png" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex">
        <Button className="" theme="primary-alt" size="xs" onClick={onDownload}>
          Download
        </Button>
        <Button
          className="ml-3"
          theme="primary-alt"
          size="xs"
          onClick={onDuplicate}
        >
          Duplicate
        </Button>
        <Button
          className="ml-3"
          theme="primary-alt"
          size="xs"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </footer>
  </div>
);

export default Item;
