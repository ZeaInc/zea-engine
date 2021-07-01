describe('engine-cad-ux-collab-potree-Dead_eye_bearing', () => {
  it('Capture snapshots', () => {
    cy.visit('testing-e2e/engine-cad-ux-collab-potree.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')
    cy.get('canvas').percySnapshot('engine-cad-ux-collab-potree')

    cy.window().then((win) => {
      const variant = 'variant-01'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree - ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'variant-02'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree - ${variant}`)
    })
  })
})
describe('engine-cad-ux-collab-potree-gear_box_final_asm', () => {
  it('Capture snapshots', () => {
    cy.visit('testing-e2e/engine-cad-ux-collab-potree.html?zcad=data/gear_box_final_asm.zcad', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')
    cy.get('canvas').percySnapshot('engine-cad-ux-collab-potree-gear_box_final_asm')

    cy.window().then((win) => {
      const variant = 'variant-01'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree-gear_box_final_asm - ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'variant-02'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree-gear_box_final_asm - ${variant}`)
    })
  })
})

describe('engine-cad-ux-collab-potree-HC_SRO4', () => {
  it('Capture snapshots', () => {
    cy.visit('testing-e2e/engine-cad-ux-collab-potree.html?zcad=data/HC_SRO4.zcad', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-loading')
    cy.get('canvas').percySnapshot('engine-cad-ux-collab-potree-HC_SRO4')

    cy.window().then((win) => {
      const variant = 'variant-01'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree-HC_SRO4 - ${variant}`)
    })

    cy.window().then((win) => {
      const variant = 'variant-02'
      win.postMessage(variant)
      cy.get('@postMessage').its('lastCall.args.0').should('equal', `done-${variant}`)
      cy.get('canvas').percySnapshot(`engine-cad-ux-collab-potree-HC_SRO4 - ${variant}`)
    })
  })
})
