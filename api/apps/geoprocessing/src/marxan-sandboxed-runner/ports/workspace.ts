export abstract class Workspace {
  abstract get(): Promise<{
    workingDirectory: string;
    marxanBinaryPath: string;
    cleanup: () => Promise<void>;
  }>;
}
