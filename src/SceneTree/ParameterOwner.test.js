import { Parameter } from './Parameters/Parameter'
import { ParameterOwner } from './ParameterOwner'

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

  it('test adding and removing parameters.', () => {
    const parameterOwner = new ParameterOwner()

    const parameterAdded = jest.fn()
    const parameterRemoved = jest.fn()
    const parameterValueChanged = jest.fn()

    parameterOwner.on('parameterAdded', parameterAdded)
    parameterOwner.on('parameterRemoved', parameterRemoved)

    const foo1 = parameterOwner.addParameter(new Parameter('foo', 1, 'Number'))
    const foo2 = parameterOwner.replaceParameter(new Parameter('foo', 2, 'Number'))
    parameterOwner.removeParameter('foo')

    expect(parameterAdded).toHaveBeenCalledTimes(2)
    expect(parameterRemoved).toHaveBeenCalledTimes(2)

    foo1.setValue(4)
    foo2.setValue(5)
    parameterOwner.on('parameterValueChanged', parameterValueChanged)
    expect(parameterRemoved).toHaveBeenCalledTimes(2)
  })

  it('save to JSON and load from JSON (serialization).', () => {
    // test param without data type.
  })

  it('add a param at a given index.', () => {})

  it('removing a nonexisting param.', () => {})

  it('replacing a nonexisting param.', () => {})
  it('deprecating a param.', () => {
    const parameterOwner = new ParameterOwner()
    const foo = parameterOwner.addParameter(new Parameter('foo', 1, 'Number'))
    parameterOwner.addParameterDeprecationMapping('bar', 'foo')
    const bar = parameterOwner.getParameter('bar')
    expect(bar).toEqual(foo)
  })
})
