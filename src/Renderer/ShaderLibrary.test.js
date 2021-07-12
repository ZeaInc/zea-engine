import { shaderLibrary } from './ShaderLibrary'

describe('ShaderLibrary', () => {
  it('empty test', () => {
    expect(1).toBe(1)
  })
  // it('register shader snippet', () => {
  //   shaderLibrary.setShaderModule('foo', `int var = 10;`)
  //   expect(shaderLibrary.getShaderModule('foo')).toBe(`int var = 10;`)
  // })
  // it('test importing snippet', () => {
  //   shaderLibrary.setShaderModule(
  //     'foo.glsl',
  //     `
  //   int foo = 3;
  //   `
  //   )
  //   shaderLibrary.setShaderModule(
  //     'bar.glsl',
  //     `
  //   // bar imports foo, so this will cause a duplicate import.
  //   import 'foo.glsl'
  //   int bar = 21;
  //   `
  //   )
  //   expect(
  //     shaderLibrary.parseShader(
  //       'foo',
  //       `
  //   //
  //   import 'foo.glsl'
  //   //
  //   import 'bar.glsl'
  //   //
  //       `
  //     )
  //   ).toBe('comment')
  // })
})
