import { SetProjectBlmHandler } from '@marxan-api/modules/projects/blm/set-project-blm-handler';
import { ProjectBlmRepository } from '@marxan-api/modules/blm';
import { MemoryProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/memory-project-blm-repository';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';
import { right } from 'fp-ts/Either';

describe('set-project-blm-handler', () => {
  const projectId = 'fooId';
  let blmRepository: ProjectBlmRepository;
  let setProjectBLMHandler: SetProjectBlmHandler;

  beforeEach(() => {
    blmRepository = new MemoryProjectBlmRepository();
    setProjectBLMHandler = new SetProjectBlmHandler(blmRepository);
  });

  it('should set the correct default values', async () => {
    await setProjectBLMHandler.execute(new SetProjectBlm(projectId, 1500));
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
        range: [0, 0],
        values: [],
      }),
    );
  });
});
