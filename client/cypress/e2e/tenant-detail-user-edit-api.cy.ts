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

    it("persists cashier assigned store from user edit flow", () => {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      };
      const testEmail = `tenant-user-edit-${Date.now()}@warungin.test`;
      let createdUserId = "";
      let assignedStoreId = "";

      cy.request({
        method: "GET",
        url: `${apiBase}/outlets`,
        headers: authHeaders,
        qs: { tenantId, page: 1, limit: 500 },
      }).then((outletRes) => {
        assert.equal(outletRes.status, 200);
        const outletPayload = readData(outletRes.body);
        const outlets = outletPayload?.data || [];

        if (Array.isArray(outlets) && outlets.length > 0) {
          assignedStoreId = outlets[0].id;
          return;
        }

        return cy
          .request({
            method: "GET",
            url: `${apiBase}/outlets/active`,
            headers: authHeaders,
            qs: { tenantId },
          })
          .then((activeRes) => {
            assert.equal(activeRes.status, 200);
            const activeOutlets = readData(activeRes.body) || [];
            assert.isArray(activeOutlets);
            assert.isNotEmpty(
              activeOutlets,
              "tenant should have at least one outlet",
            );
            assignedStoreId = activeOutlets[0].id;
          });
      });

      cy.then(() => {
        cy.request({
          method: "POST",
          url: `${apiBase}/tenants/${tenantId}/users`,
          headers: authHeaders,
          body: {
            name: "Tenant Edit QA",
            email: testEmail,
            role: "CASHIER",
          },
        }).then((createRes) => {
          assert.include([200, 201], createRes.status);
          createdUserId = readData(createRes.body)?.id;
          assert.isString(createdUserId);
          assert.isNotEmpty(createdUserId);
        });
      });

      cy.then(() => {
        cy.request({
          method: "PUT",
          url: `${apiBase}/users/${createdUserId}`,
          headers: authHeaders,
          qs: { tenantId },
          body: {
            role: "CASHIER",
            permissions: {
              assignedStoreId,
              canViewReports: true,
            },
          },
        }).then((updateRes) => {
          assert.equal(updateRes.status, 200);
        });
      });

      cy.request({
        method: "GET",
        url: `${apiBase}/tenants/${tenantId}/detail`,
        headers: authHeaders,
        qs: { tenantId },
      }).then((detailRes) => {
        assert.equal(detailRes.status, 200);
        const users = readData(detailRes.body)?.users || [];
        const updatedUser = users.find((u: any) => u.id === createdUserId);
        assert.isOk(
          updatedUser,
          "created user should exist in tenant detail list",
        );
        assert.equal(
          updatedUser?.permissions?.assignedStoreId,
          assignedStoreId,
          "assigned store should persist on tenant detail payload",
        );
      });

      cy.then(() => {
        if (!createdUserId) return;
        cy.request({
          method: "DELETE",
          url: `${apiBase}/users/${createdUserId}`,
          headers: authHeaders,
          qs: { tenantId },
          failOnStatusCode: false,
        }).then((deleteRes) => {
          assert.include([200, 204], deleteRes.status);
        });
      });
    });

    it("rejects invalid assigned store from user edit flow", () => {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      };
      const testEmail = `tenant-user-invalid-store-${Date.now()}@warungin.test`;
      let createdUserId = "";

      cy.request({
        method: "POST",
        url: `${apiBase}/tenants/${tenantId}/users`,
        headers: authHeaders,
        body: {
          name: "Tenant Edit QA Invalid",
          email: testEmail,
          role: "CASHIER",
        },
      }).then((createRes) => {
        assert.include([200, 201], createRes.status);
        createdUserId = readData(createRes.body)?.id;
        assert.isString(createdUserId);
        assert.isNotEmpty(createdUserId);
      });

      cy.then(() => {
        cy.request({
          method: "PUT",
          url: `${apiBase}/users/${createdUserId}`,
          headers: authHeaders,
          qs: { tenantId },
          failOnStatusCode: false,
          body: {
            role: "CASHIER",
            permissions: {
              assignedStoreId: "00000000-0000-0000-0000-000000000000",
            },
          },
        }).then((updateRes) => {
          assert.equal(updateRes.status, 400);
        });
      });

      cy.then(() => {
        if (!createdUserId) return;
        cy.request({
          method: "DELETE",
          url: `${apiBase}/users/${createdUserId}`,
          headers: authHeaders,
          qs: { tenantId },
          failOnStatusCode: false,
        }).then((deleteRes) => {
          assert.include([200, 204], deleteRes.status);
        });
      });
    });

    it("enforces supervisor role addon policy on user creation", () => {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      };
      const testEmail = `tenant-user-supervisor-${Date.now()}@warungin.test`;
      let createdUserId = "";

      cy.request({
        method: "GET",
        url: `${apiBase}/tenants/${tenantId}/detail`,
        headers: authHeaders,
        qs: { tenantId },
      }).then((detailRes) => {
        assert.equal(detailRes.status, 200);
        const addons = readData(detailRes.body)?.addons || [];
        const hasSupervisorAddon = Array.isArray(addons)
          ? addons.some((a: any) => {
              const type = String(a?.addonType || a?.type || "").toUpperCase();
              const status = String(a?.status || "").toUpperCase();
              return type === "SUPERVISOR_ROLE" && status === "ACTIVE";
            })
          : false;

        cy.request({
          method: "POST",
          url: `${apiBase}/tenants/${tenantId}/users`,
          headers: authHeaders,
          body: {
            name: "Tenant Supervisor QA",
            email: testEmail,
            role: "SUPERVISOR",
          },
          failOnStatusCode: false,
        }).then((createRes) => {
          if (hasSupervisorAddon) {
            assert.include([200, 201], createRes.status);
            createdUserId = readData(createRes.body)?.id || "";
            assert.isNotEmpty(createdUserId);
          } else {
            assert.include([400, 409], createRes.status);
          }
        });
      });

      cy.then(() => {
        if (!createdUserId) return;
        cy.request({
          method: "DELETE",
          url: `${apiBase}/users/${createdUserId}`,
          headers: authHeaders,
          qs: { tenantId },
          failOnStatusCode: false,
        }).then((deleteRes) => {
          assert.include([200, 204], deleteRes.status);
        });
      });
    });
  });
});
