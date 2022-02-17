import { PlanningAreaTilesService } from './planning-area-tiles.service';

test('PlanningAreaTilesService', () => {
  let service: PlanningAreaTilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningAreaTilesService],
    }).compile();

    service = module.get<PlanningAreaTilesService>(PlanningAreaTilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
