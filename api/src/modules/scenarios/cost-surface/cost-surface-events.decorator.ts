import { CostSurfaceFacade } from './cost-surface.facade';
import { Request } from 'express';

export const WrapInEvents = <T extends CostSurfaceFacade, K extends keyof T>(
  target: T,
  key: K,
  descriptor: T[K] extends CostSurfaceFacade['convert']
    ? TypedPropertyDescriptor<CostSurfaceFacade['convert']>
    : never,
) => {
  const f = descriptor.value;
  if (f) {
    descriptor.value = async function (
      this: T,
      scenarioId: string,
      request: Request,
    ) {
      console.log(`Api Events?`, this.apiEvents);

      console.log(`--------- create event [start]-----`);
      console.log(`--------- create event [start]-----`);
      console.log(`--------- create event [start]-----`);
      try {
        const outcome = await f.bind(this)(scenarioId, request);
        console.log(`--------- create event [finish ok]-----`);
        console.log(`--------- create event [finish ok]-----`);
        console.log(`--------- create event [finish ok]-----`);
        return outcome;
      } catch (error) {
        console.log(`--------- create event [finish fail]-----`);
        console.log(`--------- create event [finish fail]-----`);
        console.log(`--------- create event [finish fail]-----`);
        throw error;
      }
    };
  }
  return descriptor;
};
