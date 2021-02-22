import {
  CurveFactoryLineOnly, ScaleLinear, line, curveStepBefore, curveStepAfter,
} from 'd3';

import { THUMBNAIL_OFFSET, THUMBNAIL_SIZE } from './constants';

/**
 * Return the position of the thumbnail's top right corner and the path of the line that links the
 * point to the center of the thumbnail.
 * This function assumes the curve is similar to f: x => 1 / x, when x > 0.
 * @param coords Coordinates of the point within the scales' domains
 * @param xScale Scale of the X axis
 * @param yScale Scale of the Y axis
 */
export const getThumbnailPosition = (
  coords: [number, number],
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
): { x: number, y: number, linePath: string } => {
  const xDomain = xScale.domain();
  const yDomain = yScale.domain();

  const canBeOnTop = (
    yScale(coords[1]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE > yScale(yDomain[1])
  ) && (xScale(coords[0]) - THUMBNAIL_SIZE / 2 >= xScale(xDomain[0]))
    && (xScale(coords[0]) + THUMBNAIL_SIZE / 2 <= xScale(xDomain[1]));
  const canBeOnRight = (
    xScale(coords[0]) + THUMBNAIL_OFFSET + THUMBNAIL_SIZE < xScale(xDomain[1])
  );
  const canBeOnLeft = (
    xScale(coords[0]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE > xScale(xDomain[0])
  );

  // Coordinates of the top-right corner of the thumbnail
  let x: number;
  let y: number;

  // Curve used by the line
  let lineCurve: CurveFactoryLineOnly = curveStepBefore;

  // This algorithm is not perfect and the thumbnail could still be displayed on top of
  // the line in some infrequent cases

  if (!canBeOnTop && canBeOnRight) {
    // Based on the form of the curve, this case would happen to the points located at the
    // left of the chart. To avoid collision with the line, we place the thumbnail higher
    // than the point, except if it would be outside the container. In such a case, it
    // would be displayed below.
    x = xScale(coords[0]) + THUMBNAIL_OFFSET;
    if (yScale(coords[1]) - THUMBNAIL_SIZE > yScale(yDomain[1])) {
      y = yScale(coords[1]) - THUMBNAIL_OFFSET / 3 - THUMBNAIL_SIZE;
    } else {
      y = yScale(coords[1]) + THUMBNAIL_OFFSET / 3;
      lineCurve = curveStepAfter;
    }
  } else if (!canBeOnTop && canBeOnLeft) {
    // Because of the form of the curve, we know this only happens to the points on the
    // right of the chart. This means that our only preocupation is not touching the line
    // at the bottom.
    x = xScale(coords[0]) - THUMBNAIL_OFFSET / 3 - THUMBNAIL_SIZE;
    y = yScale(coords[1]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE;
  } else {
    // The top position is both the default one, and the one when even canBeOnTop is
    // false, a case that hopefully should never happen if the curve really looks like
    // f: x => 1 / x, when w > 0
    x = xScale(coords[0]) - THUMBNAIL_SIZE / 2;
    y = yScale(coords[1]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE;
  }

  const linePath = line().curve(lineCurve)([
    [xScale(coords[0]) - x, yScale(coords[1]) - y],
    [THUMBNAIL_SIZE / 2, THUMBNAIL_SIZE / 2],
  ]);

  return { x, y, linePath };
};
