import { createTouchEvents } from './utils'

describe('pointer-events', () => {
  beforeEach(() => {
    cy.visit('testing-e2e/pointer-events.html')
  })

  describe('Mouse Events', () => {
    it('Move - Camera Manipulator', () => {
      cy.get('canvas').trigger('mousedown', 600, 500).trigger('mousemove', 650, 500).trigger('mouseup', 650, 500)
    })

    it.skip('Zoom In - Camera Manipulator', () => {
      cy.findByTestId('canvas').trigger('wheel', {
        deltaX: 0,
        deltaY: -500,
      })
    })

    it.skip('Zoom Out - Camera Manipulator', () => {
      cy.get('canvas').trigger('wheel', {
        deltaX: 0,
        deltaY: 500,
      })
    })

    it('Double Click - Geometry', () => {
      cy.get('canvas')
        .trigger('mousedown', 800, 300)
        .trigger('mouseup', 800, 300)
        .trigger('mousedown', 800, 300)
        .trigger('mouseup', 800, 300)
    })
  })

  describe('Touch Events', () => {
    it('Move - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([600, 600])
      const eTouch = createTouchEvents([550, 600])

      cy.get('canvas').trigger('touchstart', eTouchStart).trigger('touchmove', eTouch).trigger('touchend', eTouch)
    })

    it('Double Tap - Geometry', () => {
      const eTouch = createTouchEvents([800, 300])
      cy.get('canvas')
        .trigger('touchstart', eTouch)
        .trigger('touchend', eTouch)
        .trigger('touchstart', eTouch)
        .trigger('touchend', eTouch)
    })

    it('Zoom In - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([600, 600, 650, 600])
      const eTouch = createTouchEvents([500, 600, 700, 600])

      cy.get('canvas').trigger('touchstart', eTouchStart).trigger('touchmove', eTouch).trigger('touchend', eTouch)
    })

    it('Zoom Out - Camera manipulator', () => {
      const eTouchStart = createTouchEvents([500, 600, 700, 600])
      const eTouch = createTouchEvents([600, 600, 650, 600])

      cy.get('canvas').trigger('touchstart', eTouchStart).trigger('touchmove', eTouch).trigger('touchend', eTouch)
    })
  })
})
