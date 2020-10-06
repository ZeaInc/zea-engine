describe('Zea Engine', () => {
  it('Renders cutaways', () => {
    cy.visit('testing-e2e/cutaways.html')
    cy.get('canvas').percySnapshot('Cutaways')
  })
})
