import { assert } from "chai";

describe("Analytics Page API Contract", () => {
  const apiBase =
    Cypress.env("API_BASE") || "https://warungin-api.faiznute.site/api";

  it("rejects analytics predictions without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/analytics/predictions`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects custom report creation without token", () => {
    cy.request({
      method: "POST",
      url: `${apiBase}/analytics/custom-reports`,
      body: {
        name: "Unauthorized Test",
        dataType: "SALES",
        metrics: ["REVENUE"],
      },
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });

  it("rejects custom report export without token", () => {
    cy.request({
      method: "GET",
      url: `${apiBase}/analytics/custom-reports/00000000-0000-0000-0000-000000000000/export`,
      failOnStatusCode: false,
    }).then((res) => {
      assert.equal(res.status, 401);
    });
  });
});
