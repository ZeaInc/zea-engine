describe('Zea Engine', () => {
  it('Renders cutawais', () => {
    cy.visit('testing-e2e/cutaways.html')
    cy.get('canvas').percySnapshot('Cutaways')
  })
})
