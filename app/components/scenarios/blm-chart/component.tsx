import React, {
  useRef, useState, useMemo, useEffect, useCallback,
} from 'react';

import classnames from 'classnames';
import {
  scaleLinear, line, curveMonotoneX, area,
} from 'd3';

import {
  VISUALIZATION_PADDING,
  X_AXIS_HEIGHT,
  Y_AXIS_WIDTH,
  Y_BASELINE_OFFSET,
  THUMBNAIL_SIZE,
  BORDER_RADIUS,
} from './constants';
import { getThumbnailPosition } from './helpers';

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
   * Whether the point is the Boundary Length Modifier
   */
  isBlm?: boolean;
  /**
   * Image thumbnail associated with the point.
   * The BLM point shouldn't have one.
   */
  thumbnail: string | null;
};

export interface BlmChartProps {
  /**
   * Data of the chart.
   * The array should contain 6 elements: 5 points + the BLM point.
   */
  data: DataRow[];
}

export const BlmChart: React.FC<BlmChartProps> = ({ data }: BlmChartProps) => {
  const containerRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPointCoords, setHoveredPointCoords] = useState(null);

  const blmDataPoint = useMemo(() => data.find(({ isBlm }) => isBlm), [data]);

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

  const pointsWithVisibleThumbnail = useMemo(() => {
    if (hoveredPointCoords) {
      return [
        data.find(({ cost, boundaryLength }) => (
          xScale(cost) === hoveredPointCoords[0] && yScale(boundaryLength) === hoveredPointCoords[1]
        )),
      ];
    }

    // By default, the thumbnails that are visible are the ones of the first and last point, as well
    // as the one of the BLM point
    return data.filter(({ isBlm, thumbnail }, index) => (
      !!thumbnail && (index === 0 || index === data.length - 1 || isBlm)
    ));
  }, [data, hoveredPointCoords, xScale, yScale]);

  const lineGenerator = line<DataRow>()
    .curve(curveMonotoneX)
    .x((d) => xScale(d.cost))
    .y((d) => yScale(d.boundaryLength));

  const areaGenerator = area<DataRow>()
    .curve(curveMonotoneX)
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

  const onMouseEnterPoint = useCallback((coords: [number, number], thumbnail: string) => {
    if (thumbnail) {
      setHoveredPointCoords(coords);
    }
  }, [setHoveredPointCoords]);

  const onMouseLeavePoint = useCallback((coords: [number, number], thumbnail: string) => {
    if (thumbnail) {
      setHoveredPointCoords(null);
    }
  }, [setHoveredPointCoords]);

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
    <div ref={containerRef} className="w-full h-full">
      {containerRef.current && (
        <svg width={width} height={height}>
          <defs>
            {/* Clip path used to round the corners of the area */}
            <clipPath id="area-border-radius">
              <rect
                x={xScale(xDomain[0])}
                y={yScale(yDomain[1]) - BORDER_RADIUS}
                width={xScale(xDomain[1]) - xScale(xDomain[0])}
                height={yScale(yDomain[0]) - yScale(yDomain[1]) + BORDER_RADIUS}
                rx={BORDER_RADIUS}
              />
            </clipPath>
          </defs>
          {/* Y axis */}
          <g>
            <g transform={`translate(${0} ${yScale(yDomain[1])})`}>
              <text
                x={Y_AXIS_WIDTH}
                y="0"
                textAnchor="end"
                className="text-xs text-black transform translate-y-3 opacity-50"
              >
                More
              </text>
            </g>
            <g transform={`translate(${0} ${yScale(yDomain[1]) + 0.3 * (yScale(yDomain[0]) - yScale(yDomain[1]))})`}>
              <text textAnchor="end" className="text-xs text-right text-gray-600 uppercase">
                <tspan x={Y_AXIS_WIDTH} y="0">Boundary</tspan>
                <tspan x={Y_AXIS_WIDTH} y="18">length</tspan>
              </text>
            </g>
            <g transform={`translate(${0} ${yScale(yDomain[0])})`}>
              <text
                x={Y_AXIS_WIDTH}
                y="0"
                textAnchor="end"
                className="text-xs text-black opacity-50"
              >
                Less
              </text>
            </g>
          </g>
          {/* X axis */}
          <g>
            <g transform={`translate(${xScale(xDomain[0])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text x="0" y="0" className="text-xs text-black opacity-50">Less</text>
            </g>
            <g transform={`translate(${(xScale(xDomain[0]) + xScale(xDomain[1])) / 2} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text
                x="0"
                y="0"
                textAnchor="middle"
                className="text-xs text-gray-600 uppercase"
              >
                Cost
              </text>
            </g>
            <g transform={`translate(${xScale(xDomain[1])} ${yScale(yDomain[0]) + X_AXIS_HEIGHT})`}>
              <text
                x="0"
                y="0"
                textAnchor="end"
                className="text-xs text-black opacity-50"
              >
                More
              </text>
            </g>
          </g>
          {/* Area */}
          <path
            d={areaGenerator(data)}
            clipPath="url(#area-border-radius)"
            className="fill-current text-primary-500 opacity-20"
          />
          {/* Line */}
          <path d={lineGenerator(data)} className="text-black stroke-current fill-none" />
          {/* BLM indicator */}
          {blmDataPoint && (
            <g>
              <g transform={`translate(${0} ${yScale(blmDataPoint.boundaryLength)})`}>
                <text textAnchor="end" className="text-sm text-black transform translate-y-1">
                  <tspan x={Y_AXIS_WIDTH} y="0">Recommended</tspan>
                  <tspan x={Y_AXIS_WIDTH} y="21">(BLM)</tspan>
                </text>
              </g>
              <line
                x1={Y_AXIS_WIDTH + VISUALIZATION_PADDING / 2}
                x2={xScale(blmDataPoint.cost)}
                y1={yScale(blmDataPoint.boundaryLength)}
                y2={yScale(blmDataPoint.boundaryLength)}
                className="text-black stroke-current"
              />
            </g>
          )}
          {/* Thumbnails */}
          <g>
            {pointsWithVisibleThumbnail.map(({
              cost, boundaryLength, isBlm, thumbnail,
            }, index) => {
              const {
                x,
                y,
                linePath,
              } = getThumbnailPosition([cost, boundaryLength], xScale, yScale);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <g key={index} transform={`translate(${x} ${y})`}>
                  <path
                    d={linePath}
                    strokeDasharray="3"
                    className="text-black stroke-current fill-none"
                  />

                  <foreignObject
                    x={0}
                    y={0}
                    width={THUMBNAIL_SIZE}
                    height={THUMBNAIL_SIZE}
                  >
                    <div
                      className={classnames({
                        'w-full h-full rounded-2xl bg-white bg-contain': true,
                        'border-gray-800 border-2': !isBlm,
                        'border-primary-500 border-2': isBlm,
                      })}
                      style={{ backgroundImage: `url(${thumbnail})` }}
                    />
                  </foreignObject>

                </g>
              );
            })}
          </g>
          {/* Points */}
          <g>
            {data.map(({
              cost, boundaryLength, isBlm, thumbnail,
            }, index) => (
              <foreignObject
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x={xScale(cost)}
                y={yScale(boundaryLength)}
                className="w-3 h-3 transform -translate-x-1.5 -translate-y-1.5"
              >
                <div
                  className={classnames({
                    'w-3 h-3 rounded-full border-black': true,
                    'bg-white': !isBlm || !!hoveredPointCoords,
                    'bg-primary-500': isBlm && !hoveredPointCoords,
                    border: !isBlm,
                    'border-2': isBlm,
                    'cursor-pointer hover:bg-primary-500 hover:border-2': !!thumbnail,
                  })}
                  onMouseEnter={
                    () => onMouseEnterPoint([xScale(cost), yScale(boundaryLength)], thumbnail)
                  }
                  onMouseLeave={
                    () => onMouseLeavePoint([xScale(cost), yScale(boundaryLength)], thumbnail)
                  }
                  aria-hidden="true"
                />
              </foreignObject>
            ))}
          </g>
        </svg>
      )}
    </div>

  );
};

export default BlmChart;
