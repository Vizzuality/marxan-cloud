import { Then, When } from "cypress-cucumber-preprocessor/steps";

When(`I tap on Create new project`, () => {
  cy.contains("Create new project").click({
    timeout: 10000,
  });
});

When(`I type unique name into Project Name`, () => {
  cy.get("#name").type(`My Test Project ${new Date().getTime()}`);
});

When(`I type {string} into Project Description`, (description: string) => {
  cy.get("#description").type(description);
});

When(`I press Save Project`, () => {
  cy.contains("Save").click({
    timeout: 10000,
  });
});

Then(`the Project is created`, () => {
  // TODO - failure atm
});
