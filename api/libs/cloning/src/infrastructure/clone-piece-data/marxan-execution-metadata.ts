export type MarxanExecutionMetadataFolderType = 'input' | 'output';

export const marxanExecutionMetadataRelativePath = `marxan-execution-metadata.json`;
export const marxanExecutionMetadataFoldersRelativePath = `marxan-execution-metadata`;

const getFolderRelativePathPrefix = (metadataJsonRelativePath: string) =>
  metadataJsonRelativePath.substring(
    0,
    metadataJsonRelativePath.lastIndexOf('/') + 1,
  );

export const getMarxanExecutionMetadataFolderRelativePath = (
  executionId: string,
  type: MarxanExecutionMetadataFolderType,
  metadataJsonRelativePath: string,
) =>
  `${getFolderRelativePathPrefix(
    metadataJsonRelativePath,
  )}${marxanExecutionMetadataFoldersRelativePath}/${executionId}/${type}.zip`;

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
