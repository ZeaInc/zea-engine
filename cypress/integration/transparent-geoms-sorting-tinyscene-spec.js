describe('transparent-geoms-sorting-tinyscene', () => {
  it('Renders as expected', () => {
    cy.visit('testing-e2e/transparent-geoms-sorting-tinyscene.html')

    cy.get('#front').click()

    cy.get('canvas').percySnapshot(
      `transparent-geoms-sorting-tinyscene - front`
    )

    cy.get('#back').click()

    cy.get('canvas').percySnapshot(`transparent-geoms-sorting-tinyscene - back`)
  })
})
