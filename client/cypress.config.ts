import { defineConfig } from "cypress";

const baseUrl =
  process.env.CYPRESS_BASE_URL ||
  process.env.APP_BASE_URL ||
  "http://localhost:5173";

const apiBase =
  process.env.CYPRESS_API_BASE ||
  process.env.API_BASE ||
  "http://localhost:3000/api";

const tenantId = process.env.CYPRESS_TENANT_ID || process.env.TENANT_ID || "";
const superadminEmail =
  process.env.CYPRESS_SUPERADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || "";
const superadminPassword =
  process.env.CYPRESS_SUPERADMIN_PASSWORD ||
  process.env.SUPERADMIN_PASSWORD ||
  "";

export default defineConfig({
  e2e: {
    baseUrl,
    env: {
      API_BASE: apiBase,
      TENANT_ID: tenantId,
      SUPERADMIN_EMAIL: superadminEmail,
      SUPERADMIN_PASSWORD: superadminPassword,
    },
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});
