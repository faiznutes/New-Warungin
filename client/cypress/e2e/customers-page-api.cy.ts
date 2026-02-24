import { assert } from "chai";

describe("Customers Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  const readData = (body: any) => body?.data ?? body;

  it("rejects customer export without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/customers/export`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects customer stats without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/customers/stats`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  describe("authenticated super admin flow", () => {
    let token = "";
    let createdCustomerId = "";

    before(function () {
      if (!tenantId || !email || !password) {
        this.skip();
        return;
      }

      cy.request({
        method: "POST",
        url: `${apiBase}/auth/login`,
        body: { email, password },
        failOnStatusCode: false,
      }).then((res) => {
        assert.include([200, 201], res.status);
        token = readData(res.body)?.token || readData(res.body)?.access_token;
        assert.isString(token);
        assert.isNotEmpty(token);
      });
    });

    after(() => {
      if (!createdCustomerId || !token) return;

      cy.request({
        method: "DELETE",
        url: `${apiBase}/customers/${createdCustomerId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
        failOnStatusCode: false,
      }).then((res) => {
        assert.include([200, 204], res.status);
      });
    });

    it("serves customers export and stats with correct route resolution", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/customers/export`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
      }).then((res) => {
        assert.equal(res.status, 200);
        assert.isArray(readData(res.body));
      });

      cy.request({
        method: "GET",
        url: `${apiBase}/customers/stats`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
      }).then((res) => {
        assert.equal(res.status, 200);
        assert.isNumber(readData(res.body)?.total);
      });
    });

    it("applies quick add points through loyalty-points endpoint", () => {
      const uniqueTag = Date.now();
      const payload = {
        name: `Cypress QA ${uniqueTag}`,
        email: `qa+${uniqueTag}@warungin.test`,
        phone: `08123${String(uniqueTag).slice(-7)}`,
      };

      cy.request({
        method: "POST",
        url: `${apiBase}/customers`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
        body: payload,
      }).then((createRes) => {
        assert.equal(createRes.status, 201);
        const created = readData(createRes.body);
        createdCustomerId = created?.id;
        assert.isString(createdCustomerId);
        assert.isNotEmpty(createdCustomerId);

        cy.request({
          method: "POST",
          url: `${apiBase}/customers/${createdCustomerId}/loyalty-points`,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenantId,
          },
          qs: { tenantId },
          body: { points: 7 },
        }).then((pointsRes) => {
          assert.equal(pointsRes.status, 201);
          const updated = readData(pointsRes.body);
          assert.isAtLeast(updated?.loyaltyPoints ?? 0, 7);
        });
      });
    });
  });
});
