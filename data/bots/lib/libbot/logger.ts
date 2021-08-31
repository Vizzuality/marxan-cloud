import { Logger } from "https://deno.land/x/optic/mod.ts";

const logger = new Logger();

export const logError = (e: unknown) => { logger.error(JSON.stringify(e, undefined, 2)); }

export const logInfo = (e: unknown) => { logger.info(JSON.stringify(e, undefined, 2)); }

export const logDebug = (e: unknown) => { logger.debug(JSON.stringify(e, undefined, 2)); }