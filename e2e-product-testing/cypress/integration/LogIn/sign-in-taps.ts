import { When } from "cypress-cucumber-preprocessor/steps";

When(`I tap on the Sign In on Navigation Bar`, () => {
  cy.contains("Sign in").click();
});

When(`I tap on Sign In under form`, () => {
  cy.get("main > div").contains("Sign in").click({
    timeout: 20000,
  });
});
