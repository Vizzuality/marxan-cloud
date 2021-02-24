import { ScaleLinear } from 'd3';

import { BORDER_RADIUS, THUMBNAIL_OFFSET, THUMBNAIL_SIZE } from './constants';

/**
 * Return the path of a line that goes from point 1 to point 2 with a rounded step before or after
 * curve.
 * This function assumes the horizontal (dx) and vertical (dy) distance between the two points is at
 * least radius.
 * @param p1Coords Coordinates of the first point
 * @param p2Coords Coordinates of the second point
 * @param step Whether the curve is along a “step before” or “step after” curve
 * @param radius Radius of the corner
 */
const getRoundedLinePath = (
  p1Coords: [number, number],
  p2Coords: [number, number],
  step: 'before' | 'after',
  radius: number,
): string => {
  // If the points are aligned horizontally or vertically, we return a straight line
  if (p1Coords[0] === p2Coords[0] || p1Coords[1] === p2Coords[1]) {
    return `M ${p1Coords[0]} ${p1Coords[1]} L ${p2Coords[0]} ${p2Coords[1]}`;
  }

  const isP2Up = p2Coords[1] < p1Coords[1];
  const isP2Right = p2Coords[0] > p1Coords[0];

  if (step === 'before') {
    // The sweep flag is a parameter of the A (arc) instruction. Depending on where is positioned p2
    // relative to p1, it needs to be set to 0 or 1.
    //
    // Here we use a truth table to determine the condition that will set it to 1:
    // +--------+-----------+-----------+
    // | isP2Up | isP2Right | sweepFlag |
    // +--------+-----------+-----------+
    // |    0   |     0     |     1     |
    // +--------+-----------+-----------+
    // |    0   |     1     |     0     |
    // +--------+-----------+-----------+
    // |    1   |     0     |     0     |
    // +--------+-----------+-----------+
    // |    1   |     1     |     1     |
    // +--------+-----------+-----------+
    //
    // This truth table corresponds to the one of a XNOR logical gate, meaning our condition to get
    // sweepFlag to true is the following one:
    const sweepFlag = isP2Up === isP2Right;

    return `
      M ${p1Coords[0]} ${p1Coords[1]}
      L ${p1Coords[0]} ${p2Coords[1] + radius * (p2Coords[1] > p1Coords[1] ? -1 : 1)}
      A ${radius} ${radius} 0 0 ${+sweepFlag} ${p1Coords[0] + radius * (p2Coords[0] > p1Coords[0] ? 1 : -1)} ${p2Coords[1]}
      L ${p2Coords[0]} ${p2Coords[1]}
    `;
  }

  // The condition for sweepFlag is here the one of a XOR logical gate
  const sweepFlag = isP2Up !== isP2Right;

  return `
    M ${p1Coords[0]} ${p1Coords[1]}
    L ${p2Coords[0] + radius * (p2Coords[0] > p1Coords[0] ? -1 : 1)} ${p1Coords[1]}
    A ${radius} ${radius} 0 0 ${+sweepFlag} ${p2Coords[0]} ${p1Coords[1] + radius * (p2Coords[1] > p1Coords[1] ? 1 : -1)}
    L ${p2Coords[0]} ${p2Coords[1]}
  `;
};

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

  // Whether the curve used by the line is “step before” or “step after”
  let lineCurveStepBefore = true;

  // This algorithm is not perfect and the thumbnail could still be displayed on top of
  // the line in some infrequent cases

  if (!canBeOnTop && canBeOnRight) {
    // Based on the form of the curve, this case would happen to the points located at the
    // left of the chart. To avoid collision with the line, we place the thumbnail higher
    // than the point, except if it would be outside the container. In such a case, it
    // would be displayed below.
    x = xScale(coords[0]) + THUMBNAIL_OFFSET;
    if (yScale(coords[1]) - THUMBNAIL_SIZE > yScale(yDomain[1])) {
      y = yScale(coords[1]) - THUMBNAIL_OFFSET / 2 - THUMBNAIL_SIZE;
    } else {
      y = yScale(coords[1]) + THUMBNAIL_OFFSET / 2;
      lineCurveStepBefore = false;
    }
  } else if (!canBeOnTop && canBeOnLeft) {
    // Because of the form of the curve, we know this only happens to the points on the
    // right of the chart. This means that our only preocupation is not touching the line
    // at the bottom.
    x = xScale(coords[0]) - THUMBNAIL_OFFSET / 2 - THUMBNAIL_SIZE;
    y = yScale(coords[1]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE;
  } else {
    // The top position is both the default one, and the one when even canBeOnTop is
    // false, a case that hopefully should never happen if the curve really looks like
    // f: x => 1 / x, when w > 0
    x = xScale(coords[0]) - THUMBNAIL_SIZE / 2;
    y = yScale(coords[1]) - THUMBNAIL_OFFSET - THUMBNAIL_SIZE;
  }

  const linePath = getRoundedLinePath(
    [xScale(coords[0]) - x, yScale(coords[1]) - y],
    [THUMBNAIL_SIZE / 2, THUMBNAIL_SIZE / 2],
    lineCurveStepBefore ? 'before' : 'after',
    BORDER_RADIUS,
  );

  return { x, y, linePath };
};
