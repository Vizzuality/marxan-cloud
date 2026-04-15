import { Request, Response } from "express";
import puppeteer, { PDFOptions } from "puppeteer";
import { ReportOptions } from "./report-options.dto";
import { waitForReportReady } from "../../utils/wait-function";
import { passthroughConsole } from "../../utils/passthrough-console.utils";
import { validateRequest } from "../../utils/validation";

const appRouteTemplate = "/reports/:projectId/:scenarioId/solutions?solutionId=:solutionId";

export const generateSummaryReportForScenario = async (
  req: Request,
  res: Response
) => {
  const {
    body: { baseUrl, cookie, pdfOptions, reportOptions },
  }: { body: { baseUrl: string; cookie: string; pdfOptions: PDFOptions, reportOptions: ReportOptions } } =
    req;

  const {
    params: { projectId, scenarioId },
  } = req;

  const solutionId = reportOptions.solutionId

  const validation = validateRequest(
    { projectId, scenarioId, solutionId },
    baseUrl,
  );
  if (!validation.valid) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  const pageUrl = `${baseUrl}${appRouteTemplate
    .replace(":projectId", projectId)
    .replace(":scenarioId", scenarioId)
    .replace(":solutionId", solutionId)}`;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: 'new',
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60e3);
    // Pass through browser console to our own service's console
    page.on('console', passthroughConsole);

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
      await page.setExtraHTTPHeaders({ cookie, 'Bypass-Tunnel-Reminder': 'true' });
    } else {
      await page.setExtraHTTPHeaders({ 'Bypass-Tunnel-Reminder': 'true' });
    }

    console.info(`Rendering ${pageUrl} as PDF`);
    await page.goto(pageUrl);
    await page.waitForFunction(waitForReportReady);
    const pageAsPdf = await page.pdf(pdfOptions);

    res.type("application/pdf");
    res.end(pageAsPdf);
  } finally {
    await browser.close().catch((err: unknown) =>
      console.error('Failed to close browser:', err),
    );
  }
};
