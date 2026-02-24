import { assert } from "chai";

describe("Tenant Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  it("rejects tenant detail without token", () => {
    const unauthTenantId = tenantId || "00000000-0000-0000-0000-000000000000";

    cy.request({
      method: "GET",
      url: `${apiBase}/tenants/${unauthTenantId}/detail`,
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
        token = res.body?.data?.token || res.body?.data?.access_token;
        assert.isString(token, "auth token should be string");
        assert.isNotEmpty(token, "auth token should not be empty");
      });
    });

    it("loads tenant detail for super admin", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/tenants/${tenantId}/detail`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body?.data?.tenant?.id, tenantId);
      });
    });

    it("returns available addon catalog for tenant scope", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/addons/available`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: { tenantId },
      }).then((res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body?.data);
        assert.isNotEmpty(res.body?.data);
      });
    });

    it("blocks super admin destructive self-action", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/auth/me`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((meRes) => {
        const userId =
          meRes.body?.data?.id ||
          meRes.body?.data?.user?.id ||
          meRes.body?.data?.data?.id ||
          meRes.body?.data?.data?.user?.id;
        assert.isString(userId);
        assert.isNotEmpty(userId);

        cy.request({
          method: "PUT",
          url: `${apiBase}/users/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenantId,
          },
          qs: { tenantId },
          body: { isActive: false },
          failOnStatusCode: false,
        }).then((res) => {
          assert.equal(res.status, 403);
        });
      });
    });
  });
});
