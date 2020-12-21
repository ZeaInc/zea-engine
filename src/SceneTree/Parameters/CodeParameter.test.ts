import { CodeParameter } from './CodeParameter'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CodeParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.getValue()).toEqual('')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Sets language.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()
    codeParameter.setLanguage('c')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.getLanguage()).toEqual('c')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.getDataType()).toEqual('String')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    codeParameter.setValue(snippet)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.getValue()).toEqual(snippet)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    codeParameter.setValue(snippet)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.toJSON()).toEqual({ value: snippet })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    const input = { value: snippet }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    codeParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(codeParameter.getValue()).toEqual(snippet)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    const parameter = new CodeParameter('TestParameter')
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(snippet)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
