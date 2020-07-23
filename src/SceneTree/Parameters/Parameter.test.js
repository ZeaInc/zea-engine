import { Parameter } from './Parameter'
import { ParameterOwner } from '../ParameterOwner'

describe('ParameterOwner', () => {
  it('has empty params count', () => {
    const parameterOwner = new ParameterOwner()

    expect(parameterOwner.getNumParameters()).toEqual(0)
  })

  it('it emits an event when a parameter is added.', () => {
    const parameterOwner = new ParameterOwner()

    const mockFn = jest.fn()

    parameterOwner.on('parameterAdded', mockFn)

    const name = 'foo'
    const parameter = new Parameter(name)

    parameterOwner.addParameter(parameter)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('name can be setted', () => {
    const name1 = 'foo'
    const name2 = 'bar'
    const parameter = new Parameter(name1)
    parameter.setName(name2)

    expect(parameter.getName()).toEqual(name2)
  })

  test('Saving to JSON (serialization).', () => {
    const parameter = new Parameter('name', 'value')

    const expOutput = '{"value":"value"}'

    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  test('Loading from JSON (deserialization).', () => {
    const edited = 'Edited'
    const json = { value: edited }

    const parameter = new Parameter('name', 'value')
    parameter.fromJSON(json)

    // TODO: test that the USER_EDITED flag was set.

    expect(parameter.getValue()).toEqual(edited)
  })

  it('add a param at a given index.', () => {})

  it('removing a nonexisting param.', () => {})

  it('replacing a nonexisting param.', () => {})
})
