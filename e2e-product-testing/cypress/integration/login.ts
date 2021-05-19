describe("MVP Flow", () => {
  it("Create project", () => {
    cy.visit("https://marxan.vercel.app/", {
      timeout: 10000,
    });
    cy.contains("Sign in").click();

    cy.get("#login-username").type("aa@example.com");
    cy.get("#login-password").type("aauserpassword");

    cy.get("main > div").contains("Sign in").click({
      timeout: 20000,
    });
    cy.screenshot();

    cy.contains("Create new project").click({
      timeout: 10000,
    });

    cy.get("#name").type(`My Test Project ${new Date().getTime()}`);
    cy.get("#description").type(`Lorem Ipsum`);

    cy.contains("Save").click({
      timeout: 10000,
    });

    cy.wait(2000);
    cy.screenshot();
  });
});
