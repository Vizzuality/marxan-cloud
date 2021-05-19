import { When } from "cypress-cucumber-preprocessor/steps";

When(`I type username and password`, () => {
  cy.get("#login-username").type("aa@example.com");
  cy.get("#login-password").type("aauserpassword");
});
