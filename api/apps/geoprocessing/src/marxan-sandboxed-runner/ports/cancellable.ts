export interface Cancellable {
  cancel(): Promise<void>;
}
