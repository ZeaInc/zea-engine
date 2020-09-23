describe('Zea Engine', () => {
  it('Can use a `canvas` as root element', () => {
    cy.visit('testing-e2e/canvas-as-root.html')
    cy.get('canvas').percySnapshot('Canvas as root')
  })
})
