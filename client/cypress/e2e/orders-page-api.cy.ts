import { assert } from "chai";

describe("Orders Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  const readData = (body: any) => body?.data ?? body;

  it("rejects orders list without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/orders`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects orders search endpoint without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/orders/search`,
      qs: { q: "ORD" },
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  describe("authenticated super admin flow", () => {
    let token = "";

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

    it("returns filtered orders list and supports search route", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/orders`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: {
          tenantId,
          status: "PENDING",
          search: "ORD",
          limit: 5,
        },
      }).then((res) => {
        assert.equal(res.status, 200);
        const payload = readData(res.body);
        if (Array.isArray(payload)) {
          assert.isArray(payload);
        } else {
          assert.isArray(payload?.data);
          assert.isObject(payload?.pagination);
        }
      });

      cy.request({
        method: "GET",
        url: `${apiBase}/orders/search`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: {
          tenantId,
          q: "ORD",
        },
      }).then((res) => {
        assert.equal(res.status, 200);
        assert.isArray(readData(res.body));
      });
    });
  });
});
