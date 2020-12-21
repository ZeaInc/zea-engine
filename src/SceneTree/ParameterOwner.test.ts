import { Parameter } from './Parameters/Parameter'
import { ParameterOwner } from './ParameterOwner'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ParameterOwner', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has empty params count', () => {
    const parameterOwner = new ParameterOwner()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterOwner.getNumParameters()).toEqual(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('it emits an event when a parameter is added.', () => {
    const parameterOwner = new ParameterOwner()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    parameterOwner.on('parameterAdded', mockFn)

    const name = 'foo'
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter(name)

    parameterOwner.addParameter(parameter)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('test adding and removing parameters.', () => {
    const parameterOwner = new ParameterOwner()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const parameterAdded = jest.fn()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const parameterRemoved = jest.fn()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const parameterValueChanged = jest.fn()

    parameterOwner.on('parameterAdded', parameterAdded)
    parameterOwner.on('parameterRemoved', parameterRemoved)

    const foo1 = parameterOwner.addParameter(new Parameter('foo', 1, 'Number'))
    const foo2 = parameterOwner.replaceParameter(new Parameter('foo', 2, 'Number'))
    parameterOwner.removeParameter('foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterAdded).toHaveBeenCalledTimes(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterRemoved).toHaveBeenCalledTimes(2)

    foo1.setValue(4)
    foo2.setValue(5)
    parameterOwner.on('parameterValueChanged', parameterValueChanged)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterRemoved).toHaveBeenCalledTimes(2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('save to JSON and load from JSON (serialization).', () => {
    // test param without data type.
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('add a param at a given index.', () => {})

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('removing a nonexisting param.', () => {})

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('replacing a nonexisting param.', () => {})
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it.skip('deprecating a param.', () => {
    const parameterOwner = new ParameterOwner()
    const foo = parameterOwner.addParameter(new Parameter('foo', 1, 'Number'))
    parameterOwner.addParameterDeprecationMapping('bar', 'foo')

    let bar
    try {
      bar = parameterOwner.getParameter('bar')
    } catch (e) {}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bar).toEqual(foo)
  })
})
