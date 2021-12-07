import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

interface SelectionStatusFile {
  localFilePath: string;
}

export enum LockStatus {
  LockedIn = "locked-in",
  LockedOut = "locked-out",
}

export class SelectionStatus {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async setInclusionsFromFile(
    file: SelectionStatusFile,
    scenarioId: string,
  ): Promise<unknown> {
    return await this.setFromFile(file, scenarioId, LockStatus.LockedIn);
  }

  async setExclusionsFromFile(
    file: SelectionStatusFile,
    scenarioId: string,
  ): Promise<unknown> {
    return await this.setFromFile(file, scenarioId, LockStatus.LockedOut);
  }

  private async setFromFile(
    file: SelectionStatusFile,
    scenarioId: string,
    status: LockStatus,
  ): Promise<unknown> {
    const opStart = Process.hrtime();
    try {
      const action = status === LockStatus.LockedIn ? "include" : "exclude";
      const rawData = await Deno.readTextFile(file.localFilePath);
      const data = JSON.parse(rawData);
      const result = await this.baseHttpClient.post(
        `/scenarios/${scenarioId}/planning-units`,
        {
          byGeoJson: {
            [action]: [data],
          },
        },
      );
      logInfo(
        `Planning unit lock status (${action}) for scenario set in ${
          tookMs(Process.hrtime(opStart))
        }ms.`,
      );
      return result;
    } catch (e) {
      logError(`Error setting ${status} from file: ${JSON.stringify(e)}`);
    }
  }
}
