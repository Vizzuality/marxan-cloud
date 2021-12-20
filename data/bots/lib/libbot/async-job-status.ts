import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
import _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { ms } from "https://deno.land/x/ms@v0.1.0/ms.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

const DEFAULT_WATCH_TIMEOUT = 1800;

type WaitKinds = "short" | "some" | "long";

interface JsonApiProjectStatus {
  attributes: ProjectStatus;
}

export const WaitForTime: Record<WaitKinds, RetryOptions> = {
  short: {
    delay: "10s",
    interval: "10s",
    maxTries: 60,
  },
  some: {
    delay: "30s",
    interval: "30s",
    maxTries: 60,
  },
  long: {
    delay: "60s",
    interval: "30s",
    maxTries: 120,
  },
};

export enum ScenarioJobKinds {
  geoFeatureCopy = "geofeatureCopy",
  planningAreaProtectedCalculation = "planningAreaProtectedCalculation",
  specification = "specification",
  marxanRun = "run",
}

export enum ProjectJobKinds {
  planningUnitCalculation = "planningUnits",
}

export enum JobStatuses {
  running = "running",
  done = "done",
  failure = "failure",
}

interface JobStatus {
  kind: ScenarioJobKinds | ProjectJobKinds;
  status: JobStatuses;
}

interface ScenarioStatus {
  id: string;
  jobs: JobStatus[];
}

interface ProjectStatus {
  jobs: JobStatus[];
  scenarios: ScenarioStatus[];
}

interface ProjectOrScenario {
  projectId: string;
  scenarioId?: string;
}

export interface JobSpecification {
  kind: ScenarioJobKinds | ProjectJobKinds;
  for: ProjectOrScenario;
}

type msTime = string;

interface RetryOptions {
  delay?: msTime;
  interval: msTime;
  maxTries: number;
}

export class AsyncJobStatus {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  /**
   * Given a specification (description) of an async job for a project or any of
   * its scenarios, get scenario status data and return the status of the job
   * described in the specification, if it exists.
   */
  async get(job: JobSpecification): Promise<JobStatuses | undefined> {
    const projectStatus: ProjectStatus | void = await this.baseHttpClient.get(
      `/projects/${job.for.projectId}/scenarios/status`,
    )
      .then(getJsonApiDataFromResponse)
      .then((data: JsonApiProjectStatus) => data.attributes)
      .catch(logError);
    logDebug(`Project status:\n${Deno.inspect(projectStatus, { depth: 8 })}`);
    return Object.values(ProjectJobKinds).includes(job.kind as ProjectJobKinds)
      ? projectStatus?.jobs?.find((i) => i.kind === job.kind)?.status
      : projectStatus?.scenarios?.find((i) => i.id === job.for.scenarioId)?.jobs
        .find((i) => i.kind === job.kind)?.status;
  }

  async waitFor(
    job: JobSpecification,
    until: JobStatuses,
    retryOptions: RetryOptions,
  ): Promise<boolean> {
    logInfo(
      `Polling for ${job.kind} until status is ${until} for ${
        job.for.scenarioId
          ? "scenario " + job.for.scenarioId
          : "project " + job.for.projectId
      }...`,
    );

    if (retryOptions?.delay) {
      const delay = ms(retryOptions.delay ?? "0") as number;
      logDebug(`Waiting for ${delay / 1e3}s before starting to poll status...`);
      await sleep(delay / 1e3);
    }

    const interval = ms(retryOptions.interval) as number;

    for (const i of [...Array(retryOptions.maxTries).keys()]) {
      logInfo(`Retry ${i} of ${retryOptions.maxTries}...`);
      const status = await this.get(job);
      if (status === until) {
        logInfo(`Current status is ${status}.`);
        return true;
      }
      if (status === JobStatuses.failure) {
        logError(`Operation failed.`);
        return false;
      }
      logInfo(`Current status is ${status}: waiting for ${interval / 1e3}s`);
      await sleep(interval / 1e3);
    }

    return false;
  }

  async waitForPlanningUnitCalculationsFor(
    projectId: string,
    waitForTime: keyof typeof WaitForTime = "some",
  ): Promise<boolean> {
    const opStart = Process.hrtime();

    const waitResult = await this.waitFor(
      {
        kind: ProjectJobKinds.planningUnitCalculation,
        for: {
          projectId,
        },
      },
      JobStatuses.done,
      WaitForTime[waitForTime],
    );

    const tookSeconds = tookMs(Process.hrtime(opStart)) / 1e3;

    if (waitResult) {
      logInfo(`Planning grid calculations done in ${tookSeconds}s.`);
    } else {
      logInfo(
        `Waited for ${tookSeconds}s for planning grid calculations, but operation is still ongoing.`,
      );
    }

    return waitResult;
  }

  async waitForPlanningAreaProtectedCalculationFor(
    projectId: string,
    scenarioId: string,
    waitForTime: keyof typeof WaitForTime = "short",
  ): Promise<boolean> {
    const opStart = Process.hrtime();

    const waitResult = await this.waitFor(
      {
        kind: ScenarioJobKinds.planningAreaProtectedCalculation,
        for: {
          projectId,
          scenarioId,
        },
      },
      JobStatuses.done,
      WaitForTime[waitForTime],
    );

    const tookSeconds = tookMs(Process.hrtime(opStart)) / 1e3;

    if (waitResult) {
      logInfo(`Protected area calculations done in ${tookSeconds}s.`);
    } else {
      logInfo(
        `Waited for ${tookSeconds}s for protected area calculations, but operation is still ongoing.`,
      );
    }

    return waitResult;
  }

  async waitForFeatureSpecificationCalculationFor(
    projectId: string,
    scenarioId: string,
    waitForTime: keyof typeof WaitForTime = "some",
  ): Promise<boolean> {
    const opStart = Process.hrtime();

    const waitResult = await this.waitFor(
      {
        kind: ScenarioJobKinds.specification,
        for: {
          projectId,
          scenarioId,
        },
      },
      JobStatuses.done,
      WaitForTime[waitForTime],
    );

    const tookSeconds = tookMs(Process.hrtime(opStart)) / 1e3;

    if (waitResult) {
      logInfo(
        `Geofeature specification calculations done in ${tookSeconds}s.`,
      );
    } else {
      logInfo(
        `Waited for ${tookSeconds}s for geofeature specification calculations, but operation is still ongoing.`,
      );
    }

    return waitResult;
  }

  async waitForMarxanCalculationsFor(
    projectId: string,
    scenarioId: string,
    waitForTime: keyof typeof WaitForTime = "some",
  ): Promise<boolean> {
    const opStart = Process.hrtime();

    const waitResult = await this.waitFor(
      {
        kind: ScenarioJobKinds.marxanRun,
        for: {
          projectId,
          scenarioId,
        },
      },
      JobStatuses.done,
      WaitForTime[waitForTime],
    );

    const tookSeconds = tookMs(Process.hrtime(opStart)) / 1e3;

    if (waitResult) {
      logInfo(`Marxan calculations done in ${tookSeconds}s.`);
    } else {
      logInfo(
        `Waited for ${tookSeconds}s for Marxan calculations, but operation is still ongoing.`,
      );
    }

    return waitResult;
  }
}
