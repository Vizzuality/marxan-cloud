import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from './marxan-bot.ts';
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
import _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { ms } from 'https://deno.land/x/ms@v0.1.0/ms.ts';
import { logError, logInfo, logDebug } from './logger.ts';
import { tookMs } from './util/perf.ts';

const DEFAULT_WATCH_TIMEOUT = 1800;

type WaitKinds = 'short' | 'some' | 'long';

export const WaitForTime:  Record<WaitKinds, RetryOptions> = {
  short: {
    delay: '10s',
    interval: '10s',
    maxTries: 60,
  },
  some: {
    delay: '30s',
    interval: '30s',
    maxTries: 60,
  },
  long: {
    delay: '60s',
    interval: '30s',
    maxTries: 120,
  }
};

export enum ScenarioJobKinds {
  geoFeatureCopy = 'geofeatureCopy',
  planningAreaProtectedCalculation = 'planningAreaProtectedCalculation',
  specification = 'specification',
}

export enum JobStatuses {
  running = 'running',
  done = 'done',
}

interface JobStatus {
  kind: ScenarioJobKinds;
  status: JobStatuses;
}

interface ScenarioStatus {
  id: string;
  jobs: JobStatus[];
}

interface ProjectStatus {
  scenarios: ScenarioStatus[];
}

export interface JobSpecification {
  jobKind: ScenarioJobKinds,
  forProject: string,
  forScenario: string,
};

type msTime = string;

interface RetryOptions {
  delay?: msTime;
  interval: msTime;
  maxTries: number;
}

export class ScenarioJobStatus {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async get(job: JobSpecification): Promise<JobStatuses | undefined> {
    const projectStatus: ProjectStatus = await this.baseHttpClient.get(`/projects/${job.forProject}/scenarios/status`)
      .then(getJsonApiDataFromResponse)
      .then(data => data.attributes)
      .catch(logError);
    logDebug(`Project status:\n${projectStatus}`);
    return projectStatus?.scenarios.find(i => i.id === job.forScenario)?.jobs.find(i => i.kind === job.jobKind)?.status;
  }

  async waitFor(job: JobSpecification, until: JobStatuses, retryOptions: RetryOptions): Promise<boolean> {
    logInfo(`Polling for ${job.jobKind} until status is ${until} for scenario ${job.forScenario}...`);

    if(retryOptions?.delay) {
      const delay = ms(retryOptions.delay ?? '0') as number;
      logDebug(`Waiting for ${delay / 1e3}ms before starting to poll status...`)
      await sleep(delay / 1e3);
    }

    const interval = ms(retryOptions.interval) as number;

    for(const i of [...Array(retryOptions.maxTries).keys()]) {
      logInfo(`Retry ${i} of ${retryOptions.maxTries}...`);
      const status = await this.get(job);
      if(status === until) {
        logInfo(`Current status is ${status}.`);
        return true;
      }
      logInfo(`Current status is ${status}: waiting for ${interval / 10e2}s`);
      await sleep(interval / 10e2);
    }

    return false;
  }

  async waitForPlanningAreaProtectedCalculationFor(projectId: string, scenarioId: string, waitForTime: keyof typeof WaitForTime = 'short'): Promise<boolean> {
    return await this.waitFor({
      jobKind: ScenarioJobKinds.planningAreaProtectedCalculation,
      forProject: projectId,
      forScenario: scenarioId,
    },
    JobStatuses.done,
    WaitForTime[waitForTime]);
  }

  async waitForFeatureSpecificationCalculationFor(projectId: string, scenarioId: string, waitForTime: keyof typeof WaitForTime = 'some'): Promise<boolean> {
    return await this.waitFor({
      jobKind: ScenarioJobKinds.specification,
      forProject: projectId,
      forScenario: scenarioId,
    },
    JobStatuses.done,
    WaitForTime[waitForTime]);
  }
}
