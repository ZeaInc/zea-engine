describe('Zea Engine performance', () => {
  it('Behaves properly under memory stress', () => {
    cy.visit('testing-e2e/memory-test.html')
    cy.get('#status', { timeout: 70000 }).should('have.text', 'Done')
    cy.get('canvas').percySnapshot('Memory test')
  })
})
