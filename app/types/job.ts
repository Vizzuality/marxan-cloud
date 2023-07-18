export interface Job<T = unknown> {
  data?: T;
  kind: string;
  status: 'done' | 'running' | 'failure';
  isoDate: string;
}
