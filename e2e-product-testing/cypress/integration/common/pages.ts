import { Given } from "cypress-cucumber-preprocessor/steps";

Given("I am on a main page", () => {
  cy.visit("https://marxan.vercel.app/", {
    timeout: 10000,
  });
  // Should be ensure given step was executed?
  cy.title().should("equal", "Home");
});
