import { Request, Response } from "express";
import puppeteer, { PDFOptions } from "puppeteer";
import { ReportOptions } from "./report-options.dto";
import { waitForReportReady } from "../../utils/wait-function";
import { passthroughConsole } from "../../utils/passthrough-console.utils";

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

  if (!(projectId || scenarioId || solutionId)) {
    res.status(400).json({
      error: `Invalid request: projectId (${projectId}), scenarioId (${scenarioId}) or solutionId (${solutionId}) were not provided.`,
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
    .replace(":solutionId", solutionId)}`;

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

  console.info(`Rendering ${pageUrl} as PDF`);
  await page.goto(pageUrl);
  await page.waitForFunction(waitForReportReady, { timeout: 30e3 });
  const pageAsPdf = await page.pdf({ ...pdfOptions, timeout: 30e3 });

  await page.close();
  await browser.close();

  res.type("application/pdf");
  res.end(pageAsPdf);
};
