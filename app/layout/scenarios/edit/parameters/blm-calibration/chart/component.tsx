import React, {
  useRef, useState, useMemo, useEffect, useCallback,
} from 'react';

import classnames from 'classnames';
import {
  scaleLinear, line, area, format,
} from 'd3';
import { blmFormat } from 'utils/units';

import Tooltip from 'components/tooltip';

import {
  VISUALIZATION_PADDING,
  X_AXIS_HEIGHT,
  Y_AXIS_WIDTH,
  Y_BASELINE_OFFSET,
} from './constants';

type DataRow = {
  /**
   * Value of the X axis
   */
  cost: number;
  /**
   * Value of the Y axis
   */
  boundaryLength: number;
  /**
   * Blm value of that intersection
  */
  blmValue: number;
  /**
   * Whether the point is the Boundary Length Modifier
   */
  isBlm?: boolean;
  /**
   * Image thumbnail associated with the point.
   * The BLM point shouldn't have one.
   */
  pngData: string | null;
};

export interface BlmChartProps {
  /**
   * Data of the chart.
   * The array should contain 6 elements: 5 points + the BLM point.
   */
  data: DataRow[];

  /**
   * selected BLM value.
  */
  selected: number;

  /**
   * onChange selection.
   */
  onChange: (v: number) => void;
}

export const BlmChart: React.FC<BlmChartProps> = ({
  data,
  selected,
  onChange,
}: BlmChartProps) => {
  const containerRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const costValues = useMemo(() => {
    return data?.map((v) => v.cost);
  }, [data]);

  const maxCostValue = format('.3~s')(Math.ceil(Math.max(...costValues) / 1000) * 1000);
  const minCostValue = format('.3~s')(Math.floor(Math.min(...costValues) / 1000) * 1000);

  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  const xDomain = useMemo(() => [
    Math.min(...data.map((d) => d.cost)),
    Math.max(...data.map((d) => d.cost)),
  ], [data]);

  const xScale = useMemo(
    () => scaleLinear()
      .domain(xDomain)
      .range([Y_AXIS_WIDTH + VISUALIZATION_PADDING, width - VISUALIZATION_PADDING]),
    [xDomain, width],
  );

  const yDomain = useMemo(() => {
    const min = Math.min(...data.map((d) => d.boundaryLength));
    const max = Math.max(...data.map((d) => d.boundaryLength));
    return [min - (Y_BASELINE_OFFSET * (max - min)), max];
  }, [data]);

  const yScale = useMemo(
    () => scaleLinear()
      .domain(yDomain)
      .range([height - X_AXIS_HEIGHT - VISUALIZATION_PADDING, VISUALIZATION_PADDING]),
    [yDomain, height],
  );

  const lineGenerator = line<DataRow>()
    // .curve(curveMonotoneX)
    .x((d) => xScale(d.cost))
    .y((d) => yScale(d.boundaryLength));

  const areaGenerator = area<DataRow>()
    .x((d) => xScale(d.cost))
    .y0(yScale(yDomain[0]))
    .y1((d) => yScale(d.boundaryLength));

  /**
   * Update the dimensions of the SVG
   */
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width: w, height: h } = containerRef.current.getBoundingClientRect();
      setDimensions({ width: w, height: h });
    }
  }, [containerRef, setDimensions]);

  /**
   * When containerRef changes, we update the dimensions of the SVG
   */
  useEffect(() => {
    updateDimensions();
  }, [containerRef, updateDimensions]);

  /**
   * On mount, we add a listener to the resize event to update the dimensions of the SVG.
   * Technically, this is not on mount, but whenever updateDimensions is updated (which should be
   * once, after mounting).
   */
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {containerRef.current && (
        <svg width={width} height={height}>
          {/* X axis */}
          <g>
            <g transform={`translate(${xScale(xDomain[0])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text
                x="0"
                y="0"
                className="text-xs text-white fill-current"
              >
                {minCostValue}
              </text>
            </g>
            <g transform={`translate(${(xScale(xDomain[0]) + xScale(xDomain[1])) / 2} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text
                x="0"
                y="0"
                textAnchor="middle"
                className="text-xs text-white fill-current"
              >
                Cost
              </text>
            </g>
            <g transform={`translate(${xScale(xDomain[1])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text
                className="text-xs text-white fill-current"
                x="0"
                y="0"
                textAnchor="end"
              >
                {maxCostValue}
              </text>
            </g>
          </g>
          {/* Area */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="35%" stopColor="#FFFFFF4D" />
              <stop offset="55%" stopColor="#FFFFFF33" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d={areaGenerator(data)}
            fill="url(#gradient)"
          />
          {/* Line */}
          <path d={lineGenerator(data)} className="text-white stroke-current stroke-2 opacity-30 fill-none" />
          {/* Points */}
          <g>
            {data.map(({
              cost, boundaryLength, blmValue,
            }, index) => (
              <foreignObject
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x={xScale(cost)}
                y={yScale(boundaryLength)}
                className="w-3 h-3 transform -translate-x-1.5 -translate-y-1.5"
              >
                <Tooltip
                  content={(
                    <div className="flex flex-col p-2 bg-white rounded-md">
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-600">Boundary Length:</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          {`${blmFormat(boundaryLength)}`}
                        </div>
                      </div>
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-600">Cost:</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          {`${blmFormat(cost)}`}
                        </div>
                      </div>
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-600">BLM:</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          {`${blmFormat(blmValue)}`}
                        </div>
                      </div>
                    </div>
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={classnames({
                      'w-3 h-3 rounded-full border-blue-500 border-2 bg-black hover:bg-primary-500 cursor-pointer hover:border-2': true,
                      'bg-blue-500': blmValue === selected,
                    })}
                    onClick={() => {
                      onChange(blmValue);
                    }}
                  />
                </Tooltip>
              </foreignObject>
            ))}
          </g>
        </svg>
      )}
    </div>

  );
};

export default BlmChart;
