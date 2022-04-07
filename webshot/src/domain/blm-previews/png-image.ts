import { Request, Response } from "express";
import puppeteer, { ScreenshotOptions } from "puppeteer";
import { passthroughConsole } from "../../utils/passthrough-console.utils";
import { waitForReportReady } from "../../utils/wait-function";

const appRouteTemplate =
  "/reports/:projectId/:scenarioId/blm?blmValue=:blmValue";

export const generatePngImageFromBlmData = async (
  req: Request,
  res: Response
) => {
  const {
    body: { baseUrl, cookie, screenshotOptions },
  }: {
    body: {
      baseUrl: string;
      cookie: string;
      screenshotOptions: ScreenshotOptions;
    };
  } = req;

  const {
    params: { projectId, scenarioId, blmValue },
  } = req;

  if (!(projectId || scenarioId || blmValue)) {
    res.status(400).json({
      error: `Invalid request: projectId (${projectId}), scenarioId (${scenarioId}) or blmValue (${blmValue}) were not provided.`,
    });
    return;
  }

  if (!baseUrl) {
    res.status(400).json({ error: "No baseUrl was provided." });
    return;
  }

  try {
    new URL(baseUrl);
  } catch (error) {
    res
      .status(400)
      .json({ error: `The provided baseUrl (${baseUrl} is not a valid URL.` });
    return;
  }

  const pageUrl = `${baseUrl}${appRouteTemplate
    .replace(":projectId", projectId)
    .replace(":scenarioId", scenarioId)
    .replace(":blmValue", blmValue)}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  // Pass through browser console to our own service's console
  page.on('console', passthroughConsole);

  /**
   * The webshot service authenticates to the upstream frontend instance by
   * passing through the cookie that it receives from the API. In practice, all
   * that is needed is the `__Secure-next-auth.session-token` cookie (or
   * `next-auth.session-token` in development environments where the frontend
   * may not be running behind an HTTPS reverse proxy).
   */
  if (cookie) await page.setExtraHTTPHeaders({ cookie });

  console.info(`Rendering ${pageUrl} as PNG`);
  await page.goto(pageUrl);
  await page.waitForFunction(waitForReportReady, { timeout: 30e3 });

  const pageAsPng = await Promise.race([
    page.screenshot({ ...screenshotOptions }),
    new Promise((resolve, reject) => setTimeout(reject, 30e3)),
  ]);
  await page.close();
  await browser.close();

  res.type("image/png");
  res.end(pageAsPng);
};
