import { createHash } from "crypto";
import { expand } from "dotenv-expand";
import { config } from "dotenv-flow";

// set env at import-time

if (!process.env.NODE_ENV)
  throw new Error(
    "The NODE_ENV environment variable is required but was not specified."
  );

expand(config());

export const envRaw: typeof process.env = {
  // Useful for determining whether we’re running in production mode.
  // Most importantly, it switches React into the correct mode.
  NODE_ENV: process.env.NODE_ENV || "development",
  // We support configuring the sockjs pathname during development.
  // These settings let a developer run multiple simultaneous projects.
  // They are used as the connection `hostname`, `pathname` and `port`
  // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
  // and `sockPort` options in webpack-dev-server.
  WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
  WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
  WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
};

const envRequired: string[] = [
  "WEBPACK_MATCHMAKER",
  "WEBPACK_MATCHMAKER_HELPER",
];

for (const env of envRequired) {
  if (!(env in process.env))
    throw new Error(`Missing required environment variable: ${env}`);

  envRaw[env] = process.env[env];
}

const envHash = createHash("md5");
envHash.update(JSON.stringify(envRaw));
export const envRawHash = envHash.digest("hex");

export const envRawStringified: Record<string, string> = {};

for (const key in envRaw) envRawStringified[key] = JSON.stringify(envRaw[key]);
