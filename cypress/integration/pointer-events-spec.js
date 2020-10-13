import { createTouchEvents, cyFocusCanvas } from './utils'

describe('pointer-events', () => {
  beforeEach(() => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
  })

  describe('Mouse Events', () => {
    it('Move - Camera Manipulator', () => {
      cy.get('canvas')
        .trigger('mousedown', 600, 500)
        .trigger('mousemove', 650, 500)
        .trigger('mouseup', 650, 500)
        .percySnapshot(`MoveCameraManipulator`)
    })

    it('Mouse Enter - Geometry', () => {
      cyFocusCanvas()

      cy.get('canvas').trigger('mousemove', 100, 230).trigger('mousemove', 250, 230).percySnapshot(`MouseEnterGeometry`)
    })

    it('Mouse Leave - Geometry', () => {
      cyFocusCanvas()

      cy.get('canvas').trigger('mousemove', 250, 230).trigger('mousemove', 100, 230).percySnapshot(`MouseLeaveGeometry`)
    })

    it('Zoom In - Camera Manipulator', () => {
      cyFocusCanvas()

      cy.get('canvas').trigger('wheel', {
        deltaX: -0,
        deltaY: -200,
        deltaZ: 0,
      })

      cy.get('@postMessage').its('lastCall.args.0').should('equal', 'done-wheeling')
      cy.percySnapshot(`ZoomInCameraManipulator`)
    })

    it('Zoom Out - Camera Manipulator', () => {
      cyFocusCanvas()

      cy.get('canvas').trigger('wheel', {
        deltaX: -0,
        deltaY: 500,
        deltaZ: 0,
      })

      cy.get('@postMessage')
        .its('lastCall.args.0')
        .should('equal', 'done-wheeling')
        .percySnapshot(`ZoomOutCameraManipulator`)
    })

    it('Double Click - Geometry', () => {
      cy.get('canvas')
        .trigger('mousedown', 800, 300)
        .trigger('mouseup', 800, 300)
        .trigger('mousedown', 800, 300)
        .trigger('mouseup', 800, 300)

      cy.get('@postMessage')
        .its('lastCall.args.0')
        .should('equal', 'done-double-down-on-geom')
        .percySnapshot(`DoubleClickGeometry`)
    })
  })

  describe('Touch Events', () => {
    it('Move - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([600, 600])
      const eTouch = createTouchEvents([550, 600])

      cy.get('canvas')
        .trigger('touchstart', eTouchStart)
        .trigger('touchmove', eTouch)
        .trigger('touchend', eTouch)
        .percySnapshot(`DoubleClickGeometry`)
    })

    it('Double Tap - Geometry', () => {
      const eTouch = createTouchEvents([800, 300])
      cy.get('canvas')
        .trigger('touchstart', eTouch)
        .trigger('touchend', eTouch)
        .trigger('touchstart', eTouch)
        .trigger('touchend', eTouch)

      cy.get('@postMessage')
        .its('lastCall.args.0')
        .should('equal', 'done-double-down-on-geom')
        .percySnapshot(`DoubleClickGeometry`)
    })

    it('Zoom In - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([600, 600, 650, 600])
      const eTouch = createTouchEvents([500, 600, 700, 600])

      cy.get('canvas')
        .trigger('touchstart', eTouchStart)
        .trigger('touchmove', eTouch)
        .trigger('touchend', eTouch)
        .percySnapshot(`DoubleClickGeometry`)
    })

    it('Zoom Out - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([500, 600, 700, 600])
      const eTouch = createTouchEvents([600, 600, 650, 600])

      cy.get('canvas')
        .trigger('touchstart', eTouchStart)
        .trigger('touchmove', eTouch)
        .trigger('touchend', eTouch)
        .percySnapshot(`DoubleClickGeometry`)
    })
  })
})
