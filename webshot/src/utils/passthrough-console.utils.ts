import * as puppeteer from 'puppeteer';
import { inspect } from 'util';

export const passthroughConsole = async (msg: puppeteer.ConsoleMessage) => {
  for (let i = 0; i < msg.args().length; ++i)
    console.debug(inspect(msg.args()[i]?._remoteObject, undefined, 5));
};
