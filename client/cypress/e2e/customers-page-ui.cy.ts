import { assert } from "chai";

describe("Customers Page UI", () => {
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

        cy.visit("/app/customers", {
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
    cy.visit("/app/customers", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  describe("authenticated super admin flow", () => {
    before(function () {
      if (!tenantId || !email || !password) {
        this.skip();
      }
    });

    it("loads customers page and performs search", () => {
      cy.intercept("GET", "**/customers*").as("getCustomers");

      authenticateAndVisit();

      cy.contains("Pelanggan").should("be.visible");
      cy.wait("@getCustomers").its("response.statusCode").should("eq", 200);

      cy.get('input[placeholder*="Cari pelanggan"]')
        .should("be.visible")
        .clear()
        .type("UI-SMOKE");

      cy.wait("@getCustomers");
    });

    it("opens quick add points modal when customer action is available", () => {
      authenticateAndVisit();

      cy.get("body").then(($body) => {
        if ($body.find('button[title="Tambah Poin"]').length === 0) {
          cy.contains("Belum Ada Pelanggan").should("be.visible");
          return;
        }

        cy.get('button[title="Tambah Poin"]').first().click();
        cy.contains("Tambah Poin").should("be.visible");
        cy.get('input[placeholder="Masukkan jumlah poin"]').should(
          "be.visible",
        );
      });
    });

    it("opens customer detail and edit modal flow without saving", () => {
      cy.intercept("GET", "**/customers*").as("getCustomers");

      authenticateAndVisit();
      cy.wait("@getCustomers").its("response.statusCode").should("eq", 200);

      cy.get("body").then(($body) => {
        if ($body.text().includes("Belum Ada Pelanggan")) {
          cy.contains("Belum Ada Pelanggan").should("be.visible");
          return;
        }

        if ($body.find('button[title="Hapus Pelanggan"]').length === 0) {
          cy.contains("Pelanggan").should("be.visible");
          return;
        }

        cy.contains("button", "Detail").first().click({ force: true });
        cy.contains("Detail Pelanggan").should("be.visible");

        cy.contains("button", "Edit Profil").click({ force: true });
        cy.contains(/Edit Pelanggan|Tambah Pelanggan Baru/).should(
          "be.visible",
        );
        cy.contains("button", "Batal").click({ force: true });

        cy.contains("Detail Pelanggan").should("be.visible");
      });
    });
  });
});
