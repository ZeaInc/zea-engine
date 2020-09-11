describe('Zea Engine performance', () => {
  it('Behaves properly under memory stress', () => {
    cy.visit('testing-e2e/memory-test.html', { timeout: 70000 })
    cy.get('canvas').percySnapshot('Memory test')
  })
})
