import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

function stripJsonComments(value) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

if (!process.env.NEXT_PUBLIC_API_URL) {
  try {
    const wranglerConfig = JSON.parse(stripJsonComments(readFileSync("wrangler.jsonc", "utf8")));
    const apiUrl = wranglerConfig.vars?.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      process.env.NEXT_PUBLIC_API_URL = apiUrl;
    }
  } catch {
    // next.config.ts reports the missing value with a clear build error.
  }
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/with-public-env.mjs <command> [...args]");
  process.exit(1);
}

const child = spawn(command, args, {
  env: process.env,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
