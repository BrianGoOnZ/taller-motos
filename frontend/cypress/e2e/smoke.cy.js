describe('Smoke test - entorno base', () => {
  it('carga la página principal correctamente', () => {
    cy.visit('/');
    cy.contains('Panel Administrativo').should('be.visible');
  });
});
