describe('transparent-geoms-sorting-tinyscene', () => {
  it('Renders as expected', () => {
    cy.visit('testing-e2e/transparent-geoms-sorting-tinyscene.html')

    cy.get('#front').click()
    cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-front`)
    cy.get('canvas').percySnapshot(`transparent-geoms-sorting-tinyscene - front`)

    cy.get('#back').click()
    cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-back`)
    cy.get('canvas').percySnapshot(`transparent-geoms-sorting-tinyscene - back`)
  })
})
