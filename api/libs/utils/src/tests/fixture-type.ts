import { PromiseType } from 'utility-types';

type FixtureFn = (...args: any[]) => Promise<any>;

export type FixtureType<T extends FixtureFn> = PromiseType<ReturnType<T>>;
