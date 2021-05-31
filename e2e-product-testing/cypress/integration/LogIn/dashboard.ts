import { Then } from "cypress-cucumber-preprocessor/steps";

Then(`I see my dashboard`, () => {
  cy.contains(`Welcome`).should("exist");
});
