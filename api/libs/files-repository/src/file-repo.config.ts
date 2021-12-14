import { IsString, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class FileRepoConfig {
  @IsString()
  API_SHARED_FILE_STORAGE_LOCAL_PATH!: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(
    FileRepoConfig,
    {
      API_SHARED_FILE_STORAGE_LOCAL_PATH: '/tmp/storage',
      ...config,
    },
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
