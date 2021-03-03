import React from 'react';
import cx from 'classnames';

import Avatar from 'components/avatar';
import Button from 'components/button';

import { ItemProps } from './types';

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  area,
  description,
  lastUpdate,
  contributors = [],
  style,
  onDownload,
  onDuplicate,
  onDelete,
}: ItemProps) => (
  <div
    style={style}
    className={cx({
      'flex flex-col rounded-4xl bg-gray-800 px-8 py-10 text-white': true,
      [className]: !!className,
    })}
  >
    <header className="flex-1">
      <h3 className="text-xs font-medium tracking-widest uppercase font-heading">
        {area}
      </h3>
      <h2 className="mt-3 mb-10 text-lg font-medium font-heading">{name}</h2>
      <div className="mb-3 text-sm">
        <span>Last scenario creation:</span>
        <span className="ml-2 text-primary-500">
          {lastUpdate || 'no scenario'}
        </span>
      </div>
      <div className="text-sm opacity-50 clamp-2">{description}</div>
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
        <Button className="" theme="secondary" size="xs" onClick={onDownload}>
          Download
        </Button>
        <Button
          className="ml-3"
          theme="secondary"
          size="xs"
          onClick={onDuplicate}
        >
          Duplicate
        </Button>
        <Button className="ml-3" theme="secondary" size="xs" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </footer>
  </div>
);

export default Item;
