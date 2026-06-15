import { AppConfig } from '@marxan-api/utils/config.utils';
import { featureCsvUpload, projectImport } from './upload-limits';

describe('upload-limits: project import & feature CSV', () => {
  afterEach(() => jest.restoreAllMocks());

  const mockConfig = (overrides: Record<string, number>) =>
    jest
      .spyOn(AppConfig, 'get')
      .mockImplementation(((property: string, defaultValue: number) =>
        property in overrides ? overrides[property] : defaultValue) as never);

  it('projectImport defaults to 1 GiB (matches frontend PROJECT_UPLOADER_MAX_SIZE)', () => {
    mockConfig({});
    expect(projectImport()?.fileSize).toBe(1073741824);
  });

  it('projectImport honours fileUploads.limits.projectImport when configured', () => {
    mockConfig({ 'fileUploads.limits.projectImport': 12345 });
    expect(projectImport()?.fileSize).toBe(12345);
  });

  it('featureCsvUpload defaults to 50 MiB (matches frontend FEATURES_UPLOADER_CSV_MAX_SIZE)', () => {
    mockConfig({});
    expect(featureCsvUpload()?.fileSize).toBe(52428800);
  });

  it('featureCsvUpload honours fileUploads.limits.featureCsvUpload when configured', () => {
    mockConfig({ 'fileUploads.limits.featureCsvUpload': 999 });
    expect(featureCsvUpload()?.fileSize).toBe(999);
  });
});
