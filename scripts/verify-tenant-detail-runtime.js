const { spawnSync } = require("child_process");

const FRONTEND_URL =
  process.env.APP_BASE_URL ||
  process.env.CYPRESS_BASE_URL ||
  "https://warungin.faiznute.site";
const API_BASE =
  process.env.API_BASE ||
  process.env.CYPRESS_API_BASE ||
  "https://warungin-api.faiznute.site/api";

async function checkHealth() {
  const healthUrl = API_BASE.replace(/\/api\/?$/, "") + "/health";
  const response = await fetch(healthUrl);
  if (!response.ok) {
    throw new Error(`Health endpoint failed: ${response.status}`);
  }
  const payload = await response.json();
  const status = payload?.data?.data?.status || payload?.status;
  const db =
    payload?.data?.data?.services?.database || payload?.services?.database;
  console.log(`[health] status=${status} database=${db}`);
}

function requiredEnvPresent() {
  const required = ["SUPERADMIN_EMAIL", "SUPERADMIN_PASSWORD", "TENANT_ID"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.log(
      `[env] Missing ${missing.join(", ")} -> authenticated checks will remain pending in Cypress spec.`,
    );
    return false;
  }
  console.log("[env] Authenticated env vars present.");
  return true;
}

function runCypressSpec() {
  const command = [
    "npm run test:tenant-detail:api",
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
    throw new Error(
      `Failed to execute Cypress command: ${result.error.message}`,
    );
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`Cypress command failed with status ${result.status}`);
  }
}

async function main() {
  console.log("[tenant-detail-runtime] Starting verification pack...");
  console.log(`[config] APP_BASE_URL=${FRONTEND_URL}`);
  console.log(`[config] API_BASE=${API_BASE}`);

  await checkHealth();
  requiredEnvPresent();
  runCypressSpec();

  console.log("[tenant-detail-runtime] Completed.");
}

main().catch((error) => {
  console.error(`[tenant-detail-runtime] FAILED: ${error.message}`);
  process.exit(1);
});
