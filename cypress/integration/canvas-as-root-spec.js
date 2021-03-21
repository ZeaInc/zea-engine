describe('Zea Engine', () => {
  it('Can use a `canvas` as root element', () => {
    cy.visit('testing-e2e/canvas-as-root.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')

    cy.get('canvas').percySnapshot('Canvas as root')
  })
})
