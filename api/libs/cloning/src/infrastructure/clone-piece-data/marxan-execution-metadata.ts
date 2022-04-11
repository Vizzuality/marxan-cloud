export type FolderZipType = 'input' | 'output';

export const marxanExecutionMetadataRelativePath = `marxan-execution-metadata.json`;
export const marxanExecutionMetadataFoldersRelativePath = `marxan-execution-metadata`;

export const getMarxanExecutionMetadataFolderRelativePath = (
  executionId: string,
  pathPrefix: string,
  type: FolderZipType,
) =>
  `${pathPrefix}/${marxanExecutionMetadataFoldersRelativePath}/${executionId}/${type}.zip`;

export type MarxanExecutionMetadataElement = {
  id: string;
  stdOutput?: string | null;
  stdError?: string | null;
  failed?: boolean;
  includesOutputFolder: boolean;
};

export type MarxanExecutionMetadataContent = {
  marxanExecutionMetadata: MarxanExecutionMetadataElement[];
};
