declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.svg?sprite' {
  import type { IconProps } from 'components/icon';
  const content: IconProps['icon'];
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
