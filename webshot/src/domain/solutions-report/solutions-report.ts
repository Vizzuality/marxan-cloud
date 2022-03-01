import { Request, Response } from "express";
import puppeteer, { PDFOptions } from "puppeteer";
import { waitForReportReady } from "./wait-function";

const appRouteTemplate = "/reports/:projectId/:scenarioId/solutions";

export const generateSummaryReportForScenario = async (
  req: Request,
  res: Response
) => {
  const {
    body: { baseUrl, cookie, pdfOptions },
  }: { body: { baseUrl: string; cookie: string; pdfOptions: PDFOptions } } =
    req;

  const {
    params: { projectId, scenarioId },
  } = req;

  if (!(projectId || scenarioId)) {
    res.status(400).json({
      error: `Invalid request: projectId (${projectId}) or scenarioId (${scenarioId}) were not provided.`,
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
    .replace(":scenarioId", scenarioId)}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // @todo Remove this. It's only demoware, to be able to easily take snapshots
  // as an authenticated user while we test the report workflow.
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
