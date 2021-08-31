import { BotHttpClient, getJsonApiDataFromResponse } from './marxan-bot.ts';
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
import _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { ms } from 'https://deno.land/x/ms@v0.1.0/ms.ts';

const DEFAULT_WATCH_TIMEOUT = 1800;

export enum ScenarioJobKinds {
  'geofeatureCopy',
  'planningAreaProtectedCalculation',
  'specification',
}

enum JobStatuses {
  'running',
  'done',
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
      .catch(e => console.log(e));
    return projectStatus.scenarios.find(i => i.id === job.forScenario)?.jobs.find(i => i.kind === job.jobKind)?.status;
  }

  async waitFor(job: JobSpecification, until: JobStatuses, retryOptions: RetryOptions): Promise<void> {
    if(retryOptions?.delay) {
      const delay = ms(retryOptions.delay ?? '0') as number;
      sleep(delay / 10e3);
    }

    const interval = ms(retryOptions.interval) as number;

    for(const i of [...Array(retryOptions.maxTries)]) {
      const status = await this.get(job);
      if(status === until) { return; }
      sleep(interval / 10e3);
    }
  }
}
