import { ListParameter } from './ListParameter'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ListParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const listParameter = new ListParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(listParameter.getValue()).toEqual([])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    const listParameter = new ListParameter('Foo', 'string')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(listParameter.getDataType()).toEqual('string')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    const listParameter = new ListParameter('Foo', 'string')
    const list = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    listParameter.setValue(list)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(listParameter.getValue()).toEqual(list)
  })

  /* it('saves to JSON (serialization).', () => {
    const listParameter = new ListParameter('Foo', 'string')
    const list = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    listParameter.setValue(list)

    expect(listParameter.toJSON()).toEqual({ items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] })
  })

  it('loads from JSON (serialization).', () => {
    const listParameter = new ListParameter('Foo', 'Mat3')
    const list = { items: [[1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 20, 30, 40, 50, 60, 70, 80, 90]] }
    listParameter.fromJSON(list)

    expect(listParameter.getValue()).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 20, 30, 40, 50, 60, 70, 80, 90]])
  })

  it('clones parameter object', () => {
    const parameter = new ListParameter('TestParameter')
    const list = new List(1, 2, 3, 4, 5, 6, 7, 8, 9)
    parameter.setValue(list)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
    expect(parameter.getValue()).toEqual(list)
  })*/
})
