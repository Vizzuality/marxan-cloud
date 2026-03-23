import { Request, Response } from "express";
import puppeteer, { ScreenshotOptions } from "puppeteer";
import { passthroughConsole } from "../../utils/passthrough-console.utils";
import { waitForReportReady } from "../../utils/wait-function";
import { ComparisonMapOptions } from "./comparison-map-options.dto";
import { validateRequest } from "../../utils/validation";

const appRouteTemplate =
  "/reports/:projectId/:scenarioIdA/compare/:scenarioIdB/comparison-map";

export const generateSelectionFrequencyComparisonMapForScenarios = async (
  req: Request,
  res: Response
) => {
  const {
    body: { baseUrl, cookie, comparisonMapOptions },
  }: {
    body: {
      baseUrl: string;
      cookie: string;
      comparisonMapOptions: ComparisonMapOptions;
    };
  } = req;

  const {
    params: { projectId, scenarioIdA, scenarioIdB },
  } = req;

  const validation = validateRequest(
    { projectId, scenarioIdA, scenarioIdB },
    baseUrl,
  );
  if (!validation.valid) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  const pageUrl = `${baseUrl}${appRouteTemplate
    .replace(":projectId", projectId)
    .replace(":scenarioIdA", scenarioIdA)
    .replace(":scenarioIdB", scenarioIdB)}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });
  try {
    const page = await browser.newPage();
    // Pass through browser console to our own service's console
    page.on("console", passthroughConsole);

    /**
     * The webshot service authenticates to the upstream frontend instance by
     * passing through the cookie that it receives from the API. In practice, all
     * that is needed is the `__Secure-next-auth.session-token` cookie (or
     * `next-auth.session-token` in development environments where the frontend
     * may not be running behind an HTTPS reverse proxy).
     *
     * @todo remove Bypass-Tunnel-Reminder once done with all development and
     * checks via LocalTunnel; the following line will do instead.
     *
     * if (cookie) await page.setExtraHTTPHeaders({ cookie });
     */
    if (cookie) {
      await page.setExtraHTTPHeaders({
        cookie,
        "Bypass-Tunnel-Reminder": "true",
      });
    } else {
      await page.setExtraHTTPHeaders({ "Bypass-Tunnel-Reminder": "true" });
    }

    console.info(`Rendering ${pageUrl} as PDF`);
    await page.goto(pageUrl);
    await page.waitForFunction(waitForReportReady, { timeout: 30e3 });
    const pageAsPdf = await page.pdf({ ...comparisonMapOptions, timeout: 30e3 });

    res.type("application/pdf");
    res.end(pageAsPdf);
  } finally {
    await browser.close().catch((err: unknown) =>
      console.error('Failed to close browser:', err),
    );
  }
};
