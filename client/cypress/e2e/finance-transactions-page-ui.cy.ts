import { assert } from "chai";

describe("Finance Transactions Page UI", () => {
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

        cy.visit("/app/finance/transactions", {
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
    cy.visit("/app/finance/transactions", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  describe("authenticated super admin flow", () => {
    before(function () {
      if (!tenantId || !email || !password) {
        this.skip();
      }
    });

    it("loads finance transactions page and applies search/status filters", () => {
      cy.intercept("GET", "**/orders*").as("getOrders");

      authenticateAndVisit();

      cy.contains("Total Transactions").should("be.visible");
      cy.contains("Total Volume").should("be.visible");
      cy.contains("Success Rate").should("be.visible");

      cy.wait("@getOrders").its("response.statusCode").should("eq", 200);

      cy.get("select").select("COMPLETED");
      cy.wait("@getOrders").then((interception) => {
        expect(interception.request.url).to.include("status=COMPLETED");
      });

      cy.get('input[placeholder="Search transaction ID, customer..."]')
        .clear()
        .type("ORD");
      cy.wait("@getOrders").then((interception) => {
        expect(interception.request.url).to.include("search=ORD");
      });
    });

    it("opens transaction detail modal when list has data", () => {
      authenticateAndVisit();

      cy.get("tbody").then(($tbody) => {
        if ($tbody.text().includes("Tidak ada transaksi ditemukan")) {
          cy.contains("Tidak ada transaksi ditemukan").should("be.visible");
          return;
        }

        cy.get("tbody tr").first().find("button").click();
        cy.contains("Detail Transaksi").should("be.visible");
        cy.contains("Item Pesanan").should("be.visible");
      });
    });
  });
});
