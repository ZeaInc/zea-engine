import { createTouchEvents, cyFocusCanvas } from './utils'

describe('pointer-events', () => {
  beforeEach(() => {
    cy.visit('testing-e2e/pointer-events.html')
  })

  it('Mouse Move - Camera Manipulator', () => {
    cy.get('canvas').trigger('mousedown', 'left').trigger('mousemove', 'center').trigger('mouseup', 'center')

    cy.get('canvas').percySnapshot(`MouseMoveCameraManipulator`)
  })

  it('Mouse Enter - Geometry', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 100, 230).trigger('mousemove', 250, 230)

    cy.get('canvas').percySnapshot(`MouseEnterGeometry`)
  })

  it('Mouse Leave - Geometry', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 250, 230).trigger('mousemove', 100, 230)

    cy.get('canvas').percySnapshot(`MouseLeaveGeometry`)
  })

  it('Wheel Zoom In - Camera Manipulator', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('wheel', {
      deltaX: -0,
      deltaY: -200,
      deltaZ: 0,
    })

    cy.get('canvas').percySnapshot(`WheelZoomInCameraManipulator`)
  })

  it('Wheel Zoom Out - Camera Manipulator', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('wheel', {
      deltaX: -0,
      deltaY: 500,
      deltaZ: 0,
    })

    cy.get('canvas').percySnapshot(`WheelZoomOutCameraManipulator`)
  })

  it('Double Click - Geometry', () => {
    cy.get('canvas').dblclick(800, 300)

    cy.get('canvas').percySnapshot(`DoubleClickGeometry`)
  })

  it('Touch Move - Camera manipulator', () => {
    const eTouchStart = createTouchEvents([600, 600])
    const eTouch = createTouchEvents([550, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchMoveCameraManipulator`)
  })

  it.skip('Double Tap - Geometry', () => {
    const eTouch = createTouchEvents([800, 300])
    cy.get('canvas')
      .trigger('touchstart', eTouch)
      .trigger('touchend', eTouch)
      .trigger('touchstart', eTouch)
      .trigger('touchend', eTouch)

    cy.get('canvas').percySnapshot(`DoubleTapGeometry`)
  })

  it('Touch Zoom In - Camera manipulator', () => {
    const eTouchStart = createTouchEvents([600, 600, 650, 600])
    const eTouch = createTouchEvents([500, 600, 700, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchZoomInCameraManipulator`)
  })

  it('Touch Zoom Out - Camera manipulator', () => {
    const eTouchStart = createTouchEvents([500, 600, 700, 600])
    const eTouch = createTouchEvents([600, 600, 650, 600])

    cy.get('canvas')
      .trigger('touchstart', eTouchStart)
      .trigger('touchmove', eTouch)
      .trigger('touchend', eTouch)
      .percySnapshot(`TouchZoomOutCameraManipulator`)
  })
})
