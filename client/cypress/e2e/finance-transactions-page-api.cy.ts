import { assert } from "chai";

describe("Finance Transactions Page API Contract", () => {
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
      qs: {
        status: "COMPLETED",
        limit: 5,
      },
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects order detail without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/orders/00000000-0000-0000-0000-000000000000`,
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

    it("returns orders payload compatible with finance transactions view", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/orders`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: {
          tenantId,
          limit: 10,
          status: "COMPLETED",
          search: "ORD",
        },
      }).then((res) => {
        assert.equal(res.status, 200);
        const payload = readData(res.body);
        const rows = Array.isArray(payload) ? payload : payload?.data;
        assert.isArray(rows);
        if (!Array.isArray(payload)) {
          assert.isObject(payload?.pagination);
        }

        const sample = rows[0];
        if (sample) {
          assert.isString(sample.id);
          assert.isString(sample.orderNumber);
          assert.isString(sample.status);
          assert.exists(sample.total);
          assert.isString(sample.createdAt);
        }
      });
    });

    it("returns order detail payload needed by finance detail modal", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/orders`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        qs: {
          tenantId,
          limit: 1,
        },
      }).then((listRes) => {
        const listPayload = readData(listRes.body);
        const firstOrder = listPayload?.data?.[0];

        if (!firstOrder?.id) {
          return;
        }

        cy.request({
          method: "GET",
          url: `${apiBase}/orders/${firstOrder.id}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenantId,
          },
          qs: {
            tenantId,
          },
        }).then((detailRes) => {
          assert.equal(detailRes.status, 200);
          const detail = readData(detailRes.body);
          assert.equal(detail?.id, firstOrder.id);
          assert.isArray(detail?.items);

          const firstItem = detail?.items?.[0];
          if (firstItem) {
            assert.exists(firstItem.quantity);
            assert.exists(firstItem.price);
            assert.exists(firstItem.subtotal);
          }
        });
      });
    });
  });
});
