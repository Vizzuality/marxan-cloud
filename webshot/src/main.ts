import express, { Application, json, Request, Response } from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import helmet from "helmet";

const app: Application = express();
const daemonListenPort = process.env.WEBSHOT_DAEMON_LISTEN_PORT ?? 3000;

const generateSummaryReportForProject = async (req: Request, res: Response) => {
  /**
   * @todo `pageUrl` is currently allowed (and required) in the request body
   * only for testing purposes for the initial proof-of-concept implementation.
   * This will be removed once
   */
  const {
    body: { pageUrl, viewport: { width = 1080, height = 960 } = {} },
  } = req;

  if (!pageUrl) {
    res.status(400).json({ error: "No url was provided" });
    return;
  }

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setViewport({ width, height });
  await page.setExtraHTTPHeaders({ "X-Placeholder": "placeholder" });
  console.info(`Rendering ${pageUrl} as PDF`);
  await page.goto(pageUrl);
  await page.waitForNetworkIdle();

  const pageAsPdf = await page.pdf({ timeout: 3e4 });

  await page.close();
  await browser.close();

  res.type("application/pdf");
  res.end(pageAsPdf);
};

app.use(helmet());
app.use(json());
app.use(
  cors({
    allowedHeaders: "Content-Type,Authorization,Content-Disposition",
    exposedHeaders: "Authorization",
  })
);

app.post(
  "/projects/:projectId/summary-report",
  generateSummaryReportForProject
);

app.listen(daemonListenPort, () => {
  console.info(`webshot service initialized on port ${daemonListenPort}`);
});
