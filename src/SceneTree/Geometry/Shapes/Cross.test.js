import { Cross } from './Cross'

describe('Cross', () => {
  it('tests default parameters', () => {
    const cross = new Cross()

    expect(cross.getParameter('Size').getValue()).toBe(1)
  })

  it('updates parameters', () => {
    const cross = new Cross()
    cross.getParameter('Size').setValue(5)

    expect(cross.getParameter('Size').getValue()).toBe(5)
  })

  it('saves to JSON (serialization).', () => {
    const cross = new Cross(4)
    const outputJSON = cross.toJSON()

    expect(outputJSON).toEqual({
      params: { Size: { value: 4 } },
      type: 'Cross',
      vertexAttributes: {},
    })
  })

  it('restores from JSON (serialization).', () => {
    const cross = new Cross()
    cross.fromJSON({
      params: { Size: { value: 4 } },
      type: 'Cross',
      vertexAttributes: {},
    })

    const newCross = new Cross(4)
    expect(cross.toJSON()).toEqual(newCross.toJSON())
  })
})
