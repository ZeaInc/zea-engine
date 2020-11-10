import { FilePathParameter } from './FilePathParameter'

describe('FilePathParameter', () => {
  it('Has an initial value.', () => {
    const param = new FilePathParameter()

    expect(param.getValue()).toBe('')
  })

  it('Has the correct value type.', () => {
    const param = new FilePathParameter()

    expect(param.getDataType()).toEqual('FilePath')
  })

  it("Can set it's value.", () => {
    const param = new FilePathParameter()
    param.setValue('foo')

    expect(param.getValue()).toBe('foo')
  })

  it('Can be saved to JSON (serialization).', () => {
    const param = new FilePathParameter()
    param.setValue('foo')

    expect(JSON.stringify(param.toJSON())).toMatchSnapshot()
  })

  it('Can be loaded from JSON (deserialization).', () => {
    const param = new FilePathParameter()
    param.fromJSON({ value: 'foo' })

    expect(param.getValue()).toBe('foo')
  })

  it('Can be cloned.', () => {
    const parameter = new FilePathParameter('TestParameter')
    parameter.setValue('foo')

    const clone = parameter.clone()

    expect(clone.toJSON()).toMatchSnapshot()
  })
})
