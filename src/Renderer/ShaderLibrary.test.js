import { shaderLibrary } from './ShaderLibrary'

describe('ShaderLibrary', () => {
  // it('register shader snippet', () => {
  //   shaderLibrary.setShaderModule('foo', `int var = 10;`)
  //   expect(shaderLibrary.getShaderModule('foo')).toBe(`int var = 10;`)
  // })

  it('test importing duplicate snippets', () => {
    const foo = `
    int foo = 3;
    `
    const bar = `
    // bar imports foo, so this will cause a duplicate import.
    import 'foo.glsl'
    int bar = 21;
    `
    const shader = `
    import 'foo.glsl'
    import 'bar.glsl'
    `
    const correctResult = `

    int foo = 3;
    

    // bar imports foo, so this will cause a duplicate import.
    int bar = 21;

    `
    shaderLibrary.setShaderSnippet('foo.glsl', foo)
    shaderLibrary.setShaderSnippet('bar.glsl', bar)
    const result = shaderLibrary.parseShader('shader.glsl', shader)

    expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  })

  it('import self', () => {
    const bat = `
    // bat importing itself
    import 'bat.glsl'
    int bat = 21;
    `
    const correctResult = `
    // bat importing itself
    int bat = 21;
    `
    shaderLibrary.setShaderSnippet('bat.glsl', bat)
    const result = shaderLibrary.parseShader('bat.glsl', bat)

    expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  })

  // TODO: test cycle with two files.. bar calls bat, bat calls bar, etc.
})
