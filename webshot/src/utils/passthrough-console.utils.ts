import * as puppeteer from "puppeteer";

export const passthroughConsole = (msg: puppeteer.ConsoleMessage) => {
  for (let i = 0; i < msg.args().length; ++i)
    console.debug(`${i}: ${msg.args()[i]}`);
};