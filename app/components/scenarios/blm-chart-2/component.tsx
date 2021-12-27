import React, {
  useRef, useState, useMemo, useEffect, useCallback,
} from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import classnames from 'classnames';
import {
  scaleLinear, line, area,
} from 'd3';

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
   * Whether the point is the Boundary Length Modifier
   */
  isBlm?: boolean;
  /**
   * Image thumbnail associated with the point.
   * The BLM point shouldn't have one.
   */
  thumbnail: string | null;
};

export interface BlmChart2Props {
  /**
   * Data of the chart.
   * The array should contain 6 elements: 5 points + the BLM point.
   */
  data: DataRow[];
}

export const BlmChart2: React.FC<BlmChart2Props> = ({ data }: BlmChart2Props) => {
  const containerRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const dispatch = useDispatch();

  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setBlm } = scenarioSlice.actions;

  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  const [blmImage, setBlmImage] = useState(null);

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

  // const onMouseEnterPoint = useCallback((coords: [number, number], thumbnail: string) => {
  //   if (thumbnail) {
  //     setHoveredPointCoords(coords);
  //   }
  // }, [setHoveredPointCoords]);

  // const onMouseLeavePoint = useCallback((coords: [number, number], thumbnail: string) => {
  //   if (thumbnail) {
  //     setHoveredPointCoords(null);
  //   }
  // }, [setHoveredPointCoords]);

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
      {!!blmImage && (
        <img src={blmImage} alt="selected blm" className="absolute right-0 -top-12" />
      )}
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
                Less
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
                More
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
          {/* BLM Recommendedd */}
          {/* {blmDataPoint && (
            <g>
              <g transform={`translate(${0} ${yScale(blmDataPoint.boundaryLength)})`}>
                <text
                textAnchor="end"
                className="text-sm text-white transform translate-x-10 translate-y-10 fill-current"
                >
                  <tspan x={Y_AXIS_WIDTH} y="0">Recommended</tspan>
                </text>
              </g>
              <line
                x1={Y_AXIS_WIDTH + VISUALIZATION_PADDING / 2}
                x2={xScale(blmDataPoint.cost)}
                y1={yScale(blmDataPoint.boundaryLength)}
                y2={yScale(blmDataPoint.boundaryLength)}
                className="text-white stroke-current"
              />
            </g>
          )} */}
          {/* Points */}
          <g>
            {data.map(({
              cost, boundaryLength, thumbnail,
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
                    'w-3 h-3 rounded-full border-blue-500 border-2 bg-black': true,
                    // 'bg-black': !isBlm || !!hoveredPointCoords,
                    // 'bg-primary-500': isBlm && !hoveredPointCoords,
                    // border: !isBlm,
                    // 'border-2': isBlm,
                    'cursor-pointer hover:bg-primary-500 hover:border-2': !!thumbnail,
                  })}
                  onClick={() => {
                    dispatch(setBlm(boundaryLength));
                    setBlmImage(thumbnail);
                  }}
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

export default BlmChart2;
