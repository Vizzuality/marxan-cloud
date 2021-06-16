/**
 * Makes the real executable being linked into Sandbox directory,
 * allowing to run Marxan with provided input files
 * @see InputFiles
 */
export abstract class LinkMarxan {
  abstract link(binPath: string, directoryPath: string): Promise<void>;
}
