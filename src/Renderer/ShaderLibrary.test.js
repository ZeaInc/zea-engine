import { shaderLibrary } from './ShaderLibrary'

describe('ShaderLibrary', () => {
  // it('register shader snippet', () => {
  //   shaderLibrary.setShaderModule('foo', `int var = 10;`)
  //   expect(shaderLibrary.getShaderModule('foo')).toBe(`int var = 10;`)
  // })
  it('test importing snippet', () => {
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
    const result = shaderLibrary.parseShader('shader', shader)

    console.log(JSON.stringify(result.glsl.trim()))

    console.log(JSON.stringify(correctResult.trim()))
    expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  })
})
