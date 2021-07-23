import { Given } from "cypress-cucumber-preprocessor/steps";

Given(`I am on Projects page`, () => {
  cy.visit(`https://marxan.vercel.app/projects`, {
    timeout: 10000,
  });
});
