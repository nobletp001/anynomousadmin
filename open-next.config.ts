import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

export default {
  ...config,
  buildCommand: "npm run build:next",
} satisfies OpenNextConfig;
