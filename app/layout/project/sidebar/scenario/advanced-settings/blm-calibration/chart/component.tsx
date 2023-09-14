import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';

import classnames from 'classnames';

import { scaleLinear, line, area, format } from 'd3';

import Tooltip from 'components/tooltip';
import { blmFormat } from 'utils/units';

import { VISUALIZATION_PADDING, X_AXIS_HEIGHT, Y_AXIS_WIDTH, Y_BASELINE_OFFSET } from './constants';

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

export const BlmChart: React.FC<BlmChartProps> = ({ data, selected, onChange }: BlmChartProps) => {
  const containerRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const costValues = useMemo(() => {
    return data?.map((v) => v.cost);
  }, [data]);

  const boundaryLengthValues = useMemo(() => {
    return data?.map((v) => v.boundaryLength);
  }, [data]);

  const maxCostValue = format('.3~s')(Math.ceil(Math.max(...costValues) / 1000) * 1000);
  const minCostValue = format('.3~s')(Math.floor(Math.min(...costValues) / 1000) * 1000);
  const maxBoundaryLengthValue = format('.3~s')(
    Math.ceil(Math.max(...boundaryLengthValues) / 1000) * 1000
  );

  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  const xDomain = useMemo(
    () => [Math.min(...data.map((d) => d.cost)), Math.max(...data.map((d) => d.cost))],
    [data]
  );

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain(xDomain)
        .range([Y_AXIS_WIDTH + VISUALIZATION_PADDING, width - VISUALIZATION_PADDING]),
    [xDomain, width]
  );

  const yDomain = useMemo(() => {
    const min = Math.min(...data.map((d) => d.boundaryLength));
    const max = Math.max(...data.map((d) => d.boundaryLength));
    return [min - Y_BASELINE_OFFSET * (max - min), max];
  }, [data]);

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain(yDomain)
        .range([height - X_AXIS_HEIGHT - VISUALIZATION_PADDING, VISUALIZATION_PADDING]),
    [yDomain, height]
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
    <div ref={containerRef} className="relative h-full w-full">
      {containerRef.current && (
        <div className="flex flex-col">
          <g>
            <text x="0" y="0" textAnchor="middle" className="fill-current text-xs text-white">
              Boundary length
            </text>
          </g>
          <g transform={`translate(${xScale(xDomain[0])} ${yScale(yDomain[0]) - 85})`}>
            <text x="0" y="0" className="fill-current text-xs text-white">
              {maxBoundaryLengthValue}
            </text>
          </g>
        </div>
      )}

      {containerRef.current && (
        <svg width={width} height={height}>
          {/* X axis */}
          <g>
            <g transform={`translate(${xScale(xDomain[0])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text x="0" y="0" className="fill-current text-xs text-white">
                {minCostValue}
              </text>
            </g>
            <g
              transform={`translate(${(xScale(xDomain[0]) + xScale(xDomain[1])) / 2} ${
                yScale(yDomain[0]) + X_AXIS_HEIGHT
              })`}
            >
              <text x="0" y="0" textAnchor="middle" className="fill-current text-xs text-white">
                Cost
              </text>
            </g>
            <g transform={`translate(${xScale(xDomain[1])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text className="fill-current text-xs text-white" x="0" y="0" textAnchor="end">
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
          <path d={areaGenerator(data)} fill="url(#gradient)" />
          {/* Line */}
          <path
            d={lineGenerator(data)}
            className="fill-none stroke-current stroke-2 text-white opacity-30"
          />
          {/* Points */}
          <g>
            {data.map(({ cost, boundaryLength, blmValue }, index) => (
              <foreignObject
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x={xScale(cost)}
                y={yScale(boundaryLength)}
                className="h-3 w-3 -translate-x-1.5 -translate-y-1.5 transform"
              >
                <Tooltip
                  content={
                    <div className="flex flex-col rounded-md bg-white p-2">
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-700">Boundary Length:</span>
                        </div>
                        <div className="text-xs text-gray-800">
                          {`${blmFormat(boundaryLength)}`}
                        </div>
                      </div>
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-700">Cost:</span>
                        </div>
                        <div className="text-xs text-gray-800">{`${blmFormat(cost)}`}</div>
                      </div>
                      <div className="flex justify-between space-x-2 text-xs">
                        <div>
                          <span className="text-gray-700">BLM:</span>
                        </div>
                        <div className="text-xs text-gray-800">{`${blmFormat(blmValue)}`}</div>
                      </div>
                    </div>
                  }
                >
                  <div
                    aria-hidden="true"
                    className={classnames({
                      'h-3 w-3 cursor-pointer rounded-full border-2 border-blue-600 bg-black hover:border-2 hover:bg-primary-500':
                        true,
                      'bg-blue-600': blmValue === selected,
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
