// import { RENDER_STATE, SHAPE } from './constants';

import { RENDER_STATE, SHAPE } from 'react-map-gl-draw';

const RECT_STYLE = {
  stroke: '#7ac943',
  strokeWidth: 1,
  x: -6,
  y: -6,
  height: 12,
  width: 12,
  strokeDasharray: '2,1',
};

const CIRCLE_RADIUS = 6;

const SELECTED_STYLE = {
  stroke: 'rgb(189,189,189)',
  strokeWidth: 2,
  fill: 'rgb(189,189,189)',
  fillOpacity: 0.3,
};

const HOVERED_STYLE = {
  stroke: 'rgb(189,189,189)',
  strokeWidth: 2,
  fill: 'rgb(122,202,67)',
  fillOpacity: 0.3,
};

const UNCOMMITTED_STYLE = {
  stroke: 'rgb(189,189,189)',
  strokeDasharray: '4,2',
  strokeWidth: 2,
  fill: 'rgb(189,189,189)',
  fillOpacity: 0.1,
};

const INACTIVE_STYLE = UNCOMMITTED_STYLE;

const DEFAULT_STYLE = {
  stroke: '#000000',
  strokeWidth: 2,
  fill: '#a9a9a9',
  fillOpacity: 0.1,
};

export function featureStyle({ feature, state }) {
  const type = feature.properties.shape || feature.geometry.type;
  let style: any = null;

  switch (state) {
    case RENDER_STATE.SELECTED:
      style = { ...SELECTED_STYLE };
      break;

    case RENDER_STATE.HOVERED:
      style = { ...HOVERED_STYLE };
      break;

    case RENDER_STATE.UNCOMMITTED:
    case RENDER_STATE.CLOSING:
      style = { ...UNCOMMITTED_STYLE };
      break;

    case RENDER_STATE.INACTIVE:
      style = { ...INACTIVE_STYLE };
      break;

    default:
      style = { ...DEFAULT_STYLE };
  }

  switch (type) {
    case SHAPE.POINT:
      style.r = CIRCLE_RADIUS;
      break;
    case SHAPE.LINE_STRING:
      style.fill = 'none';
      break;
    case SHAPE.POLYGON:
      if (state === RENDER_STATE.CLOSING) {
        style.strokeDasharray = '4,2';
      }

      break;
    case SHAPE.RECTANGLE:
      if (state === RENDER_STATE.UNCOMMITTED) {
        style.strokeDasharray = '4,2';
      }

      break;
    default:
  }

  return style;
}

export function editHandleStyle({ shape, state }) {
  let style: any = {};
  switch (state) {
    case RENDER_STATE.SELECTED:
      style = { ...SELECTED_STYLE };
      break;

    case RENDER_STATE.HOVERED:
      style = { ...HOVERED_STYLE };
      break;

    case RENDER_STATE.UNCOMMITTED:
    case RENDER_STATE.CLOSING:
      style = { ...UNCOMMITTED_STYLE };
      break;

    case RENDER_STATE.INACTIVE:
      style = { ...INACTIVE_STYLE };
      break;

    default:
      style = { ...DEFAULT_STYLE };
  }

  switch (shape) {
    case 'circle':
      style.r = CIRCLE_RADIUS; // eslint-disable-line
      break;
    case 'rect':
      style = { ...style, ...RECT_STYLE };
      break;
    default:
  }

  return style;
}
