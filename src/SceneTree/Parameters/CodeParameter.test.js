import { CodeParameter } from './CodeParameter'

describe('CodeParameter', () => {
  it('has an initial value.', () => {
    const codeParameter = new CodeParameter()

    expect(codeParameter.getValue()).toEqual('')
  })

  it('Sets language.', () => {
    const codeParameter = new CodeParameter()
    codeParameter.setLanguage('c')

    expect(codeParameter.getLanguage()).toEqual('c')
  })

  it('checks value type.', () => {
    const codeParameter = new CodeParameter()

    expect(codeParameter.getDataType()).toEqual('String')
  })

  it('sets value.', () => {
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    codeParameter.setValue(snippet)

    expect(codeParameter.getValue()).toEqual(snippet)
  })

  it('saves to JSON (serialization).', () => {
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `

    codeParameter.setValue(snippet)
    expect(codeParameter.toJSON()).toEqual({ value: snippet })
  })

  it('loads from JSON (serialization).', () => {
    const codeParameter = new CodeParameter()
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    const input = { value: snippet }
    codeParameter.fromJSON(input)

    expect(codeParameter.getValue()).toEqual(snippet)
  })

  it('clones parameter object', () => {
    const parameter = new CodeParameter('TestParameter')
    const snippet = `
      const fooFn = () => console.log('Foo')
    `
    parameter.setValue(snippet)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
