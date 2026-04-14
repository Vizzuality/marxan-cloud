import { Request, Response } from "express";
import puppeteer, { ScreenshotOptions } from "puppeteer";
import { passthroughConsole } from "../../utils/passthrough-console.utils";
import { waitForReportReady } from "../../utils/wait-function";
import { validateRequest } from "../../utils/validation";

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

  const validation = validateRequest(
    { projectId, scenarioId, blmValue },
    baseUrl,
  );
  if (!validation.valid) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  const pageUrl = `${baseUrl}${appRouteTemplate
    .replace(":projectId", projectId)
    .replace(":scenarioId", scenarioId)
    .replace(":blmValue", blmValue)}`;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      '--disable-web-security',
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
    ],
    headless: 'new',
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30e3);
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

    console.info(`Rendering ${pageUrl} as PNG`);
    await page.goto(pageUrl);
    await page.waitForFunction(waitForReportReady);

    const pageAsPng = await page.screenshot(screenshotOptions);

    res.type("image/png");
    res.end(pageAsPng);
  } finally {
    await browser.close().catch((err: unknown) =>
      console.error('Failed to close browser:', err),
    );
  }
};
