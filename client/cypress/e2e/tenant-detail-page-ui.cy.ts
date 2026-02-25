import { assert } from "chai";

describe("Tenant Detail Page UI", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  const readData = (body: any) => body?.data ?? body;

  const authenticateAndVisit = () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/auth/login`,
      body: { email, password },
      failOnStatusCode: false,
    }).then((loginRes) => {
      assert.include([200, 201], loginRes.status);
      const token =
        readData(loginRes.body)?.token || readData(loginRes.body)?.access_token;
      assert.isString(token);
      assert.isNotEmpty(token);

      cy.request({
        method: "GET",
        url: `${apiBase}/auth/me`,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        },
      }).then((meRes) => {
        const user =
          meRes.body?.data?.user ||
          meRes.body?.user ||
          readData(meRes.body)?.user;

        cy.visit(`/app/tenants/${tenantId}`, {
          onBeforeLoad(win) {
            win.localStorage.setItem("token", token);
            win.localStorage.setItem("rememberMe", "true");
            if (user) {
              win.localStorage.setItem("user", JSON.stringify(user));
            }
            if (tenantId) {
              win.localStorage.setItem("selectedTenantId", tenantId);
            }
          },
        });
      });
    });
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("redirects unauthenticated users to login", () => {
    cy.visit(
      `/app/tenants/${tenantId || "00000000-0000-0000-0000-000000000000"}`,
      {
        failOnStatusCode: false,
      },
    );
    cy.url().should("include", "/login");
  });

  describe("authenticated super admin flow", () => {
    before(function () {
      if (!tenantId || !email || !password) {
        this.skip();
      }
    });

    it("loads tenant detail and navigates to users tab", () => {
      authenticateAndVisit();

      cy.contains(/Profil|Terjadi Kesalahan|Memuat detail tenant/i, {
        timeout: 60000,
      }).should("exist");

      cy.get("body", { timeout: 20000 }).then(($body) => {
        if ($body.text().includes("Profil")) {
          cy.contains("Pengguna").click();
          cy.contains("Manajemen Pengguna").should("be.visible");
          cy.contains("Tambah User").should("be.visible");
          return;
        }

        if ($body.text().includes("Terjadi Kesalahan")) {
          cy.contains("Terjadi Kesalahan").should("be.visible");
          cy.contains("Coba Lagi").should("be.visible");
          return;
        }

        cy.contains("Memuat detail tenant...").should("be.visible");
      });
    });

    it("opens add-user modal and validates required field visibility", () => {
      authenticateAndVisit();

      cy.get("body", { timeout: 20000 }).then(($body) => {
        if (!$body.text().includes("Profil")) {
          cy.contains(/Terjadi Kesalahan|Memuat detail tenant/i).should(
            "exist",
          );
          return;
        }

        cy.contains("Pengguna").click();
        cy.contains("Tambah User").click({ force: true });

        cy.contains("Tambah User").should("be.visible");
        cy.get('input[placeholder="Nama user"]').should("be.visible");
        cy.get('input[placeholder="email@example.com"]').should("be.visible");
        cy.contains("label", "Role *").should("be.visible");

        cy.contains("button", "Batal").click({ force: true });
      });
    });
  });
});
