import { FilePathParameter } from './FilePathParameter'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('FilePathParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const param = new FilePathParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(param.getValue()).toBe('')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has the correct value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const param = new FilePathParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(param.getDataType()).toEqual('FilePath')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Can set it's value.", () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const param = new FilePathParameter()
    param.setValue('foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(param.getValue()).toBe('foo')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Can be saved to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const param = new FilePathParameter()
    param.setValue('foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(param.toJSON())).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Can be loaded from JSON (deserialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const param = new FilePathParameter()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    param.fromJSON({ value: 'foo' })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(param.getValue()).toBe('foo')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Can be cloned.', () => {
    const parameter = new FilePathParameter('TestParameter')
    parameter.setValue('foo')

    const clone = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(clone.toJSON()).toMatchSnapshot()
  })
})
