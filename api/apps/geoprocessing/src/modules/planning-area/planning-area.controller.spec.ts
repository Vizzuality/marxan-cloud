import { Test, TestingModule } from '@nestjs/testing';
import { PlanningAreaController } from './planning-area.controller';

describe('PlanningAreaController', () => {
  let controller: PlanningAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningAreaController],
    }).compile();

    controller = module.get<PlanningAreaController>(PlanningAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
