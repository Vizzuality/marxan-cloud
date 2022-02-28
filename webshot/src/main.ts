import express, {
  Application,
  json,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import config from "config";
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
  async (req: Request, res: Response, next: NextFunction) => {
    await generateSummaryReportForScenario(req, res).catch((error) => {
      console.error(error);
      next(error);
    });
  }
);

app.get("/api/ping", async (req: Request, res: Response) => {
  res.status(200).json({ ping: "pong" });
});

app.listen(daemonListenPort, () => {
  console.info(`webshot service initialized on port ${daemonListenPort}`);
});
