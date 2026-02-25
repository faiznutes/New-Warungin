import { assert } from "chai";

describe("Payment Webhook API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";
  const tenantId = Cypress.env("TENANT_ID");
  const email = Cypress.env("SUPERADMIN_EMAIL");
  const password = Cypress.env("SUPERADMIN_PASSWORD");

  const readData = (body: any) => body?.data ?? body;
  const signedPayload = {
    order_id: "SMOKE-SIGNED-NOTFOUND",
    transaction_status: "settlement",
    transaction_id: "txn-signed-smoke-001",
  };

  const sha512Hex = async (payload: unknown) => {
    const input = new TextEncoder().encode(JSON.stringify(payload));
    const digest = await crypto.subtle.digest("SHA-512", input);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  it("rejects payment status without auth token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/payments/status/SMOKE-ORDER-ID`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("keeps callback endpoint public (not 401) even with invalid payload", () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/payments/callback`,
      failOnStatusCode: false,
      body: {
        order_id: "SMOKE-INVALID",
        transaction_status: "settlement",
      },
      headers: {
        "x-midtrans-signature": "invalid-signature",
      },
    }).then((res) => {
      assert.notEqual(res.status, 401);
    });
  });

  it("keeps n8n webhook endpoint public (not 401) even with invalid payload", () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/payments/webhook/n8n`,
      failOnStatusCode: false,
      body: {
        order_id: "SMOKE-INVALID",
        transaction_status: "capture",
      },
      headers: {
        "x-midtrans-signature": "invalid-signature",
      },
    }).then((res) => {
      assert.notEqual(res.status, 401);
    });
  });

  it("accepts correctly signed callback payload (not forbidden)", () => {
    cy.wrap(sha512Hex(signedPayload)).then((signature) => {
      cy.request({
        method: "POST",
        url: `${apiBase}/payments/callback`,
        failOnStatusCode: false,
        body: signedPayload,
        headers: {
          "x-midtrans-signature": signature,
        },
      }).then((res) => {
        assert.notEqual(res.status, 401);
        assert.notEqual(res.status, 403);
      });
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

    it("accepts authenticated status check route with tenant scope", () => {
      cy.request({
        method: "GET",
        url: `${apiBase}/payments/status/SMOKE-ORDER-ID`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
      }).then((res) => {
        assert.notEqual(res.status, 401);
        assert.notEqual(res.status, 403);
      });
    });
  });
});
