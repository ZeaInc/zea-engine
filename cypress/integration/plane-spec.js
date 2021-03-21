describe('Zea Engine', () => {
  it('Renders a simple plane', () => {
    cy.visit('testing-e2e/plane.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')

    cy.get('canvas').percySnapshot('Simple plane')
  })
})
