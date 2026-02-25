const HEALTH_URL =
  process.env.HEALTH_URL || "https://warungin-api.faiznute.site/health";
const EXPECT_COMMIT_SHA =
  process.env.EXPECT_COMMIT_SHA || process.env.GITHUB_SHA || "";

function startsWithIgnoreCase(value, expected) {
  return value.toLowerCase().startsWith(expected.toLowerCase());
}

async function main() {
  const response = await fetch(HEALTH_URL);
  if (!response.ok) {
    throw new Error(`Health endpoint failed: ${response.status}`);
  }

  const payload = await response.json();
  const identity = payload?.data?.data?.identity || payload?.identity || {};
  const services = payload?.data?.data?.services || payload?.services || {};
  const appCommitSha = String(identity.appCommitSha || "unknown");
  const commitSource = String(identity.commitSource || "none");
  const configuredAppCommitSha = String(identity.configuredAppCommitSha || "");
  const database = String(services.database || "unknown");

  console.log(`[health] url=${HEALTH_URL}`);
  console.log(`[health] appCommitSha=${appCommitSha}`);
  console.log(`[health] commitSource=${commitSource}`);
  console.log(`[health] configuredAppCommitSha=${configuredAppCommitSha}`);
  console.log(`[health] database=${database}`);

  if (database.toLowerCase() !== "connected") {
    throw new Error(`Database not connected: ${database}`);
  }

  if (commitSource.toLowerCase() === "none") {
    throw new Error("Health identity commitSource is 'none'");
  }

  if (EXPECT_COMMIT_SHA) {
    if (!startsWithIgnoreCase(appCommitSha, EXPECT_COMMIT_SHA)) {
      throw new Error(
        `Health commit mismatch: expected prefix ${EXPECT_COMMIT_SHA}, got ${appCommitSha}`,
      );
    }
  }
}

main().catch((error) => {
  console.error(`[verify-health-identity] FAILED: ${error.message}`);
  process.exit(1);
});
