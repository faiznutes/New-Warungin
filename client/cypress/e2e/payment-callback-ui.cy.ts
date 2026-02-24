describe("Payment Callback Public Routes", () => {
  it("renders success callback state", () => {
    cy.visit(
      "/payment/success?order_id=SUB-smoke-123&transaction_status=settlement",
      {
        failOnStatusCode: false,
      },
    );

    cy.contains("Pembayaran Berhasil!").should("be.visible");
    cy.contains("Order ID").should("be.visible");
  });

  it("renders error callback state", () => {
    cy.visit("/payment/error?order_id=SUB-smoke-123&status_code=500", {
      failOnStatusCode: false,
    });

    cy.contains("Pembayaran Gagal").should("be.visible");
    cy.contains("Coba Lagi").should("be.visible");
  });

  it("renders pending callback state", () => {
    cy.visit(
      "/payment/pending?order_id=SUB-smoke-123&transaction_status=pending",
      {
        failOnStatusCode: false,
      },
    );

    cy.contains("Menunggu Pembayaran").should("be.visible");
    cy.contains("Cek Status Subscription").should("be.visible");
  });
});
