import { assert } from "chai";

describe("Reports Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";

  it("rejects tenant report endpoint without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/reports/tenant`,
      qs: { reportType: "sales", period: "monthly" },
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects reports export endpoint without token", () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/reports/export`,
      qs: { type: "daily-sales" },
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });
});
