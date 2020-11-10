describe('transparent-geoms-sorting-tinyscene', () => {
  it('Captures a snapshot', () => {
    cy.visit('testing-e2e/transparent-geoms-sorting-tinyscene.html')
    cy.get('canvas').percySnapshot('transparent-geoms-sorting-tinyscene')
  })

  it.skip('Captures snapshots of variants', () => {
    cy.visit('testing-e2e/transparent-geoms-sorting-tinyscene.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')

    cy.window().then((win) => {
      const variant = 'variant-01'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`transparent-geoms-sorting-tinyscene - ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'variant-02'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`transparent-geoms-sorting-tinyscene - ${variant}`)
    })
  })
})
