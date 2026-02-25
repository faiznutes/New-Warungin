import { assert } from "chai";

describe("Orders Page UI", () => {
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

        cy.visit("/app/orders", {
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
    cy.visit("/app/orders", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  describe("authenticated super admin flow", () => {
    before(function () {
      if (!tenantId || !email || !password) {
        this.skip();
      }
    });

    it("loads orders page and applies search/status filters", () => {
      cy.intercept("GET", "**/api/orders*").as("getOrders");

      authenticateAndVisit();

      cy.contains("Orders & Transactions").should("be.visible");
      cy.wait("@getOrders").its("response.statusCode").should("eq", 200);

      cy.get('input[placeholder="Search by Order #..."]')
        .should("be.visible")
        .click({ force: true })
        .type("{selectall}ORD", { force: true });

      cy.wait("@getOrders");

      cy.contains("button", "Completed").click();
      cy.wait("@getOrders").then((interception) => {
        expect(interception.request.url).to.include("status=COMPLETED");
      });
    });

    it("opens order detail modal when data exists", () => {
      cy.intercept("GET", "**/api/orders*").as("getOrders");

      authenticateAndVisit();
      cy.wait("@getOrders").its("response.statusCode").should("eq", 200);

      cy.get("body").then(($body) => {
        if ($body.text().includes("Belum Ada Pesanan")) {
          cy.contains("Belum Ada Pesanan").should("be.visible");
          return;
        }

        if ($body.find('button[title="View Details"]').length > 0) {
          cy.get('button[title="View Details"]').first().click({ force: true });
        } else if ($body.find("tbody tr").length > 0) {
          cy.get("tbody tr")
            .first()
            .find("button")
            .first()
            .click({ force: true });
        } else {
          cy.contains("button", "Detail").first().click();
        }
        cy.contains("Order Details").should("be.visible");
      });
    });

    it("shows editable status control or readonly badge on first order", () => {
      cy.intercept("GET", "**/api/orders*").as("getOrders");

      authenticateAndVisit();
      cy.wait("@getOrders").its("response.statusCode").should("eq", 200);

      cy.get("body").then(($body) => {
        if ($body.text().includes("Belum Ada Pesanan")) {
          cy.contains("Belum Ada Pesanan").should("be.visible");
          return;
        }

        const hasStatusSelect = $body.find("select").length > 0;
        if (hasStatusSelect) {
          cy.get("select").first().should("be.visible");
          return;
        }

        cy.contains(/Pending|Processing|Selesai|Dibatalkan|Refund/i).should(
          "be.visible",
        );
      });
    });
  });
});
