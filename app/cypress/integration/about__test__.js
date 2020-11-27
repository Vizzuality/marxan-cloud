context('About page', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('should verify the title of about page', () => {
    cy.title().should('eq', 'About');
  });
});
