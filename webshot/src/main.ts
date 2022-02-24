import express, { Application, json } from "express";
import cors from "cors";
import * as config from "config";
import helmet from "helmet";
import { generateSummaryReportForScenario } from "./domain/solutions-report/solutions-report";

const app: Application = express();
const daemonListenPort = config.get("port");

app.use(helmet());
app.use(json());
app.use(
  cors({
    allowedHeaders: "Content-Type,Authorization,Content-Disposition",
    exposedHeaders: "Authorization",
  })
);

app.post(
  "/projects/:projectId/scenarios/:scenarioId/solutions/report",
  generateSummaryReportForScenario
);

app.listen(daemonListenPort, () => {
  console.info(`webshot service initialized on port ${daemonListenPort}`);
});
