describe('Zea Engine', () => {
  it('Renders a grid', () => {
    cy.visit('testing-e2e/grid.html')
    cy.get('canvas').percySnapshot('Grid')
  })

  it('Renders a simple plane', () => {
    cy.visit('testing-e2e/plane.html')
    cy.get('canvas').percySnapshot('Simple plane')
  })

  it('Renders labels', () => {
    cy.visit('testing-e2e/labels.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-Loading')

    cy.window().then((win) => {
      const variant = 'front'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`Labels ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'back'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`Labels ${variant}`)
    })
  })

  it('Loads an OBJ asset', () => {
    cy.visit('testing-e2e/load-obj-asset.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-Loading')

    cy.window().then((win) => {
      const variant = 'front'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`OBJ asset ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'back'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`OBJ asset ${variant}`)
    })
  })
})
