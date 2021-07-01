describe('hit-testing', () => {
  it('Capture snapshots', () => {
    cy.visit('testing-e2e/hit-testing.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')
    cy.get('canvas').percySnapshot('hit-testing')

    cy.window().then((win) => {
      cy.get('canvas')
        .trigger('mousedown', 400, 250)
        .trigger('mousemove', 410, 250)
        .trigger('mousemove', 420, 250)
        .trigger('mousemove', 430, 250)
        .trigger('mousemove', 440, 250)
        .trigger('mousemove', 450, 250)
        .trigger('mouseup', 450, 250)
      const variant = 'variant-01'
      cy.get('canvas').percySnapshot(`hit-testing - ${variant}`)
    })

    cy.window().then((win) => {
      cy.get('canvas').trigger('mousedown', 400, 250).trigger('mousemove', 400, 200).trigger('mouseup', 400, 200)
      const variant = 'variant-02'
      cy.get('canvas').percySnapshot(`hit-testing - ${variant}`)
    })
  })
})
