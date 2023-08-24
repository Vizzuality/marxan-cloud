import React from 'react';

import { useRouter } from 'next/router';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';

import { cn } from 'utils/cn';

export const ResumePage = (): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);

  const projectUsersQuery = useProjectUsers(pid);
  const PUDataQuery = useScenarioPU(sid);

  const SECTION_CLASSES = 'pb-6';
  const TITLE_CLASSES = 'pb-3 text-xs font-semibold';
  const TEXT_CLASSES = 'text-xs leading-4';

  return (
    <div className="flex flex-col space-y-14 border-t border-gray-100">
      <div className="pt-10">
        {scenarioQuery.data?.description && (
          <div>
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              Description:
            </h3>
            <p
              className={cn({
                [TEXT_CLASSES]: true,
              })}
            >
              {scenarioQuery.data?.description}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-20">
        <div>
          <div
            className={cn({
              [SECTION_CLASSES]: true,
            })}
          >
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              Contributors:
            </h3>
            <p
              className={cn({
                [TEXT_CLASSES]: true,
              })}
            >
              {projectUsersQuery.data?.map((u) => u.user.displayName).join('; ')}
            </p>
          </div>

          <div
            className={cn({
              [SECTION_CLASSES]: true,
            })}
          >
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              Cost surface:
            </h3>
            <p
              className={cn({
                [TEXT_CLASSES]: true,
              })}
            >
              Lorem Ipsum
            </p>
          </div>

          {projectQuery.data?.planningUnitAreakm2 && (
            <div
              className={cn({
                [SECTION_CLASSES]: true,
              })}
            >
              <h3
                className={cn({
                  [TITLE_CLASSES]: true,
                })}
              >
                Planning Area (KM2):
              </h3>
              <p
                className={cn({
                  [TEXT_CLASSES]: true,
                })}
              >
                {projectQuery.data?.planningUnitAreakm2}
              </p>
            </div>
          )}

          {projectQuery.data?.planningUnitGridShape && (
            <div
              className={cn({
                [SECTION_CLASSES]: true,
              })}
            >
              <h3
                className={cn({
                  [TITLE_CLASSES]: true,
                })}
              >
                Planning Unit Grid Shape:
              </h3>
              <p
                className={cn({
                  [TEXT_CLASSES]: true,
                })}
              >
                {projectQuery.data?.planningUnitGridShape}
              </p>
            </div>
          )}

          <div
            className={cn({
              [SECTION_CLASSES]: true,
            })}
          >
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              Planning Unit Grid Area:
            </h3>
            <p
              className={cn({
                [TEXT_CLASSES]: true,
              })}
            >
              Lorem Ipsum
            </p>
          </div>
        </div>
        <div>
          <div
            className={cn({
              [SECTION_CLASSES]: true,
            })}
          >
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              Protected Areas:
            </h3>
            <p
              className={cn({
                [TEXT_CLASSES]: true,
              })}
            >
              Lorem Ipsum
            </p>
          </div>

          <div
            className={cn({
              [SECTION_CLASSES]: true,
            })}
          >
            <h3
              className={cn({
                [TITLE_CLASSES]: true,
              })}
            >
              No. of planning units:
            </h3>
            <div className="flex flex-col space-y-3">
              <p
                className={cn({
                  [TEXT_CLASSES]: true,
                })}
              >
                Total: {PUDataQuery.data?.available.length}
              </p>
              <p
                className={cn({
                  [TEXT_CLASSES]: true,
                })}
              >
                Included PU: {PUDataQuery.data?.included.length}
              </p>
              <p
                className={cn({
                  [TEXT_CLASSES]: true,
                })}
              >
                Excluded PU: {PUDataQuery.data?.excluded.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
