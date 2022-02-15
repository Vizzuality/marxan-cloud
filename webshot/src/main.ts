import express, { Application, json, Request, Response } from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import helmet from 'helmet';

require('dotenv').config();

const app: Application = express();

const takeScreenshot = async (req: Request, res: Response) => {
  const {
    body: { url },
  } = req;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 850 });
  await page.setExtraHTTPHeaders({ 'X-Placeholder': "placeholder" });
  console.log('webshot destination: ' + url);
  await page.goto(url);
  await page.waitForNetworkIdle();

  const pageAsPdf = await page.pdf({ timeout: 0 });

  await page.close();
  await browser.close();

  res.type('application/pdf');
  res.end(pageAsPdf);
};

app.use(helmet());
app.use(json());
app.use(cors({
  allowedHeaders: 'Content-Type,Authorization,Content-Disposition',
  exposedHeaders: 'Authorization',
}));

app.post('/webshot', takeScreenshot);

app.listen(3001, () => {
  console.info(`webshot service initialized on port 3001`);
});
