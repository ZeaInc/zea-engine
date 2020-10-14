import { createTouchEvents, cyFocusCanvas } from './utils'

describe('pointer-events', () => {
  it('Mouse Move - Camera Manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cy.get('canvas').trigger('mousedown', 600, 500).trigger('mousemove', 650, 500).trigger('mouseup', 650, 500)

    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-moving-camera')
      .percySnapshot(`MouseMoveCameraManipulator`)
  })

  it('Mouse Enter - Geometry', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 100, 230).trigger('mousemove', 250, 230)
    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-enter-geometry')
      .percySnapshot(`MouseEnterGeometry`)
  })

  it('Mouse Leave - Geometry', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 250, 230).trigger('mousemove', 100, 230)
    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-leave-geometry')
      .percySnapshot(`MouseLeaveGeometry`)
  })

  it('Wheel Zoom In - Camera Manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
    cyFocusCanvas()

    cy.get('canvas').trigger('wheel', {
      deltaX: -0,
      deltaY: -200,
      deltaZ: 0,
    })

    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-moving-camera')
      .percySnapshot(`WheelZoomInCameraManipulator`)
  })

  it('Wheel Zoom Out - Camera Manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
    cyFocusCanvas()

    cy.get('canvas').trigger('wheel', {
      deltaX: -0,
      deltaY: 500,
      deltaZ: 0,
    })

    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-moving-camera')
      .percySnapshot(`WheelZoomOutCameraManipulator`)
  })

  it.only('Double Click - Geometry', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
    cy.get('canvas')
      .trigger('mousedown', 800, 300)
      .trigger('mouseup', 800, 300)
      .trigger('mousedown', 800, 300)
      .trigger('mouseup', 800, 300)

    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-moving-camera')
      .percySnapshot(`DoubleClickGeometry`)
  })

  it('Touch Move - Camera manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html')

    const eTouchStart = createTouchEvents([600, 600])
    const eTouch = createTouchEvents([550, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchMoveCameraManipulator`)
  })

  it('Double Tap - Geometry', () => {
    cy.visit('testing-e2e/pointer-events.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })

    const eTouch = createTouchEvents([800, 300])
    cy.get('canvas')
      .trigger('touchstart', eTouch)
      .trigger('touchend', eTouch)
      .trigger('touchstart', eTouch)
      .trigger('touchend', eTouch)

    cy.get('@postMessage')
      .its('lastCall.args.0')
      .should('equal', 'done-moving-camera')
      .percySnapshot(`DoubleTapGeometry`)
  })

  it('Touch Zoom In - Camera manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html')

    const eTouchStart = createTouchEvents([600, 600, 650, 600])
    const eTouch = createTouchEvents([500, 600, 700, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchZoomInCameraManipulator`)
  })

  it('Touch Zoom Out - Camera manipulator', () => {
    cy.visit('testing-e2e/pointer-events.html')

    const eTouchStart = createTouchEvents([500, 600, 700, 600])
    const eTouch = createTouchEvents([600, 600, 650, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchZoomOutCameraManipulator`)
  })
})
