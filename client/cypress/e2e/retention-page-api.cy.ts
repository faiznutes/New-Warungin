import { assert } from "chai";

describe("Retention Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";

  it("rejects retention stats without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/retention/stats`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects retention apply endpoint without token", () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/retention/orders`,
      body: { days: 730 },
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });
});
