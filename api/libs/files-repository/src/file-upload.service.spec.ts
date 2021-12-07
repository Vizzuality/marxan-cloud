import { Test, TestingModule } from '@nestjs/testing';
import { FileRepository } from './file.repository';

describe('FileUploadService', () => {
  let service: FileRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileRepository],
    }).compile();

    service = module.get<FileRepository>(FileRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
