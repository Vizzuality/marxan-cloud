import { Test, TestingModule } from '@nestjs/testing';
import { PlanningAreaService } from './planning-area.service';

describe('PlanningAreaService', () => {
  let service: PlanningAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningAreaService],
    }).compile();

    service = module.get<PlanningAreaService>(PlanningAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
