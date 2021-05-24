import { When } from "cypress-cucumber-preprocessor/steps";

When(`I am logged in`, () => {
  cy.get("#login-username").type("aa@example.com");
  cy.get("#login-password").type("aauserpassword");
  cy.get("main > div").contains("Sign in").click({
    timeout: 20000,
  });
});
