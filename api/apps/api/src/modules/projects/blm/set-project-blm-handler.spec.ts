import { SetProjectBlmHandler } from '@marxan-api/modules/projects/blm/set-project-blm-handler';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';
import { right } from 'fp-ts/Either';
import { Test } from '@nestjs/testing';
import { MemoryProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/memory-project-blm-repository';

// TODO: Should we remove this unitary test and make a proper e2e test?
describe.skip('set-project-blm-handler', () => {
  const projectId = 'fooId';
  let blmRepository: ProjectBlmRepo;
  let setProjectBLMHandler: SetProjectBlmHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ProjectBlmRepo,
          useFactory: () => new MemoryProjectBlmRepository(),
        },
        SetProjectBlmHandler,
      ],
    }).compile();

    blmRepository = module.get(ProjectBlmRepo);
    setProjectBLMHandler = module.get(SetProjectBlmHandler);
  });

  it('should set the correct default values', async () => {
    await setProjectBLMHandler.execute(new SetProjectBlm(projectId));
    const blm = await blmRepository.get(projectId);

    expect(blm).toStrictEqual(
      right({
        defaults: [
          0.03872983346207417,
          606.799665767047,
          1213.5606017006319,
          1820.3215376342168,
          2427.0824735678016,
          3033.8434095013868,
        ],
        id: projectId,
        range: [0.001, 100],
        values: [],
      }),
    );
  });
});
