declare module 'mapshaper' {
  function runCommandsXL(command: string | string[]): Promise<void>;
  function runCommandsXL(
    command: string | string[],
    input: Record<string, any> | undefined,
    callback: (error: Error) => void,
  ): void;
  function runCommandsXL(
    command: string | string[],
    input: Record<string, any> | undefined,
  ): Promise<void>;
}
