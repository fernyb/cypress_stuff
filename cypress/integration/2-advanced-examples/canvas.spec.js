/// <reference types="cypress" />

context('Actions', () => {
  beforeEach(() => {
    cy.visit('root/draw.html')
    cy.wait(1000);
  })

  it("Draw on canvas", () => {
    const drawLine = (x, y) => {
      // cy.get("#canvas")
      // .trigger("mousedown", x, y)
      // .trigger("mousemove", x, y)
      // .trigger("mousemove", x += 100, y)
      // .trigger("mousemove", x += 100, y)
      // .trigger("mousemove", x += 100, y)
      // .trigger("mouseup", { force: true });

      cy.get("#canvas")
      .trigger("mousedown", x, y)
      .trigger("mousemove", x, y)
      .trigger("mousemove", { offsetX: x, offsetY: y })
      .trigger("mousemove", { offsetX: x += 100, offsetY: y })
      .trigger("mousemove", { offsetX: x += 100, offsetY: y })
      .trigger("mouseup", { force: true });
    };

    // Cypress._.times(10, (idx) => {
      drawLine(20, 50);
    // });
  });
})
