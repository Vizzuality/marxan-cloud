import { Request, Response } from "express";
import puppeteer from "puppeteer";

const appRouteTemplate = "/reports/:projectId/:scenarioId/solutions";

export const generateSummaryReportForScenario = async (
  req: Request,
  res: Response
) => {
  const {
    body: { baseUrl, cookie, viewport: { width = 1080, height = 960 } = {} },
  } = req;

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

  await page.setViewport({ width, height });

  // @todo Remove this. It's only demoware, to be able to easily take snapshots
  // as an authenticated user while we test the report workflow.
  if (cookie) await page.setExtraHTTPHeaders({ cookie });

  console.info(`Rendering ${pageUrl} as PDF`);
  await page.goto(pageUrl);
  await page.waitForNetworkIdle();

  const pageAsPdf = await page.pdf({ timeout: 3e4 });

  await page.close();
  await browser.close();

  res.type("application/pdf");
  res.end(pageAsPdf);
};
