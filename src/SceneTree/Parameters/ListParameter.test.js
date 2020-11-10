import { ListParameter } from './ListParameter'

describe('ListParameter', () => {
  it('has an initial value.', () => {
    const listParameter = new ListParameter()

    expect(listParameter.getValue()).toEqual([])
  })

  it('checks value type.', () => {
    const listParameter = new ListParameter('Foo', 'string')

    expect(listParameter.getDataType()).toEqual('string')
  })

  it('sets value.', () => {
    const listParameter = new ListParameter('Foo', 'string')
    const list = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    listParameter.setValue(list)

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
