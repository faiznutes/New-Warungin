const { spawnSync } = require("child_process");

const FRONTEND_URL =
  process.env.APP_BASE_URL ||
  process.env.CYPRESS_BASE_URL ||
  "https://warungin.faiznute.site";
const API_BASE =
  process.env.API_BASE ||
  process.env.CYPRESS_API_BASE ||
  "https://warungin-api.faiznute.site/api";

const specs = [
  { name: "payment-callback-ui", command: "npm run test:payment-callback:ui" },
  { name: "finance-ui", command: "npm run test:finance:ui" },
  { name: "customers-ui", command: "npm run test:customers:ui" },
  { name: "orders-ui", command: "npm run test:orders:ui" },
  { name: "tenant-detail-ui", command: "npm run test:tenant-detail:ui" },
];

function runSpec(spec) {
  const command = [
    spec.command,
    "--",
    `--config baseUrl=${FRONTEND_URL}`,
    `--env API_BASE=${API_BASE}`,
  ].join(" ");

  const result = spawnSync(command, {
    cwd: "client",
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  if (result.error) {
    throw new Error(`Failed running ${spec.name}: ${result.error.message}`);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`Spec ${spec.name} failed with status ${result.status}`);
  }
}

function checkAuthEnv() {
  const required = ["SUPERADMIN_EMAIL", "SUPERADMIN_PASSWORD", "TENANT_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.log(
      `[env] Missing ${missing.join(", ")} -> authenticated UI specs may be skipped.`,
    );
  } else {
    console.log("[env] Authenticated env vars present.");
  }
}

function main() {
  console.log("[pages-ui-runtime] Starting UI runtime verification...");
  console.log(`[config] APP_BASE_URL=${FRONTEND_URL}`);
  console.log(`[config] API_BASE=${API_BASE}`);

  checkAuthEnv();

  for (const spec of specs) {
    console.log(`[pages-ui-runtime] Running ${spec.name}...`);
    runSpec(spec);
  }

  console.log("[pages-ui-runtime] Completed.");
}

try {
  main();
} catch (error) {
  console.error(`[pages-ui-runtime] FAILED: ${error.message}`);
  process.exit(1);
}
