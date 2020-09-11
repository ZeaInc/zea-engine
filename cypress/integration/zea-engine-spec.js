describe('Zea Engine', () => {
  it('Renders a grid', () => {
    cy.visit('testing-e2e/grid.html')
    cy.get('canvas').percySnapshot('Grid')
  })

  it('Renders a simple cone', () => {
    cy.visit('testing-e2e/cone-simple.html')
    cy.get('canvas').percySnapshot('Simple cone')
  })

  it('Renders a dense cone', () => {
    cy.visit('testing-e2e/cone-dense.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.window().then((win) => {
      const variant = 'top'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`Dense cone ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'below'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`Dense cone ${variant}`)
    })
  })

  it('Renders a simple cuboid', () => {
    cy.visit('testing-e2e/cuboid-simple.html')
    cy.get('canvas').percySnapshot('Simple cuboid')
  })

  it('Renders a dense cuboid', () => {
    cy.visit('testing-e2e/cuboid-dense.html')
    cy.get('canvas').percySnapshot('Dense cuboid')
  })

  it('Renders a simple cylinder', () => {
    cy.visit('testing-e2e/cylinder.html')
    cy.get('canvas').percySnapshot('Simple cylinder')
  })

  it('Renders a simple disc', () => {
    cy.visit('testing-e2e/disc.html')
    cy.get('canvas').percySnapshot('Simple disc')
  })

  it('Renders a simple plane', () => {
    cy.visit('testing-e2e/plane.html')
    cy.get('canvas').percySnapshot('Simple plane')
  })

  it('Renders a simple sphere', () => {
    cy.visit('testing-e2e/sphere.html')
    cy.get('canvas').percySnapshot('Simple sphere')
  })

  it('Renders a simple torus', () => {
    cy.visit('testing-e2e/torus.html')
    cy.get('canvas').percySnapshot('Simple torus')
  })

  it('Renders highlights', () => {
    cy.visit('testing-e2e/highlights.html')
    cy.get('canvas').percySnapshot('Highlights')
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
