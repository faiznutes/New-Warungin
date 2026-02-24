/// <reference types="cypress" />

import { assert } from "chai";

describe("Tenant Detail User Edit API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  const readData = (body: any) => body?.data ?? body;

  it("rejects outlets list without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/outlets`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects outlets active list without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/outlets/active`,
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

    it("loads tenant detail users with permissions field", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/tenants/${tenantId}/detail`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
      }).then((res) => {
        assert.equal(res.status, 200);
        const body = readData(res.body);
        assert.isArray(body?.users);
        if (body.users.length > 0) {
          assert.property(body.users[0], "permissions");
        }
      });
    });
  });
});
