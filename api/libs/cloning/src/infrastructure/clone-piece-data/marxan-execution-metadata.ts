import { validate, version } from 'uuid';

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

const isV4Uuid = (str: string) => validate(str) && version(str) === 4;

export const isMarxanExecutionMetadataFolderRelativePath = (
  path: string,
):
  | { type: MarxanExecutionMetadataFolderType; executionId: string }
  | undefined => {
  const [zip, executionId, marxanExecutionMetadata] = path.split('/').reverse();

  const isZipFile = zip === 'input.zip' || zip === 'output.zip';
  const validExecutionId = isV4Uuid(executionId);
  const isMarxanExecutionMetadata =
    marxanExecutionMetadata === marxanExecutionMetadataFoldersRelativePath;

  if (!isZipFile || !validExecutionId || !isMarxanExecutionMetadata)
    return undefined;

  return {
    executionId,
    type: zip.replace('.zip', '') as MarxanExecutionMetadataFolderType,
  };
};

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
