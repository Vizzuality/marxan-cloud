describe("MVP Flow", () => {
  it("Create project", () => {
    cy.visit("https://marxan.vercel.app/");
    cy.contains("Sign in").click();

    cy.get("#login-username").type("aa@example.com");
    cy.get("#login-password").type("aauserpassword");

    cy.get("main > div").contains("Sign in").click();

    cy.contains("Create new project").click();

    cy.get("#name").type(`My Test Project ${new Date().getTime()}`);
    cy.get("#description").type(`Lorem Ipsum`);

    cy.contains("Save").click();
  });
});
