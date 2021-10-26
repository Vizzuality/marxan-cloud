import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { runBot as runBrazilBot } from "./demo-brazil/core.ts";
import { runBot as runAustraliaBot } from "./demo-australia/core.ts";
import { Users } from "../lib/libbot/users.ts";

const scriptPath = dirname(relative(Deno.cwd(), fromFileUrl(import.meta.url)));

const { API_URL, USERNAME, PASSWORD, POSTGRES_URL } = config({
  path: scriptPath + "/.env",
});

const settings = {
  apiUrl: API_URL,
  credentials: {
    username: USERNAME,
    password: PASSWORD,
  },
};

await new Users(settings).signUp();

await runBrazilBot(settings);
await runAustraliaBot(settings);
