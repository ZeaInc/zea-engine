import { shaderLibrary } from './ShaderLibrary'
import glslTypes from '../Renderer/GLSLConstants'
import { Vec2, Vec3, Vec4, Mat3, Mat4, Color } from '../Math/index'
import { BaseImage } from '../SceneTree/BaseImage.js'
import { SInt32, UInt32, Float32 } from '../Utilities/MathFunctions'

describe('ShaderLibrary', () => {
  // it('test simple import', () => {
  //   const foo = `
  //   int foo = 3;
  //   `

  //   const shader = `
  //   import 'foo.glsl'
  //   `
  //   const correctResult = `

  //   int foo = 3;

  //   `
  //   shaderLibrary.setShaderModule('foo.glsl', foo)
  //   const result = shaderLibrary.parseShader('shader.glsl', shader)

  //   expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  // })

  // it('test importing duplicate snippets', () => {
  //   const foo = `
  //   int foo = 3;
  //   `
  //   const bar = `
  //   // bar imports foo, so this will cause a duplicate import.
  //   import 'foo.glsl'
  //   int bar = 21;
  //   `
  //   const shader = `
  //   import 'foo.glsl'
  //   import 'bar.glsl'
  //   `
  //   const correctResult = `

  //   int foo = 3;

  //   // bar imports foo, so this will cause a duplicate import.
  //   int bar = 21;

  //   `
  //   shaderLibrary.setShaderModule('foo.glsl', foo)
  //   shaderLibrary.setShaderModule('bar.glsl', bar)
  //   const result = shaderLibrary.parseShader('shader.glsl', shader)

  //   expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  // })

  // it('import self', () => {
  //   const bat = `
  //   // bat importing itself
  //   import 'bat.glsl'
  //   int bat = 21;
  //   `
  //   const correctResult = `
  //   // bat importing itself
  //   int bat = 21;
  //   `
  //   shaderLibrary.setShaderModule('bat.glsl', bat)
  //   const result = shaderLibrary.parseShader('bat.glsl', bat)

  //   expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  // })

  // // TODO: test cycle with two files.. bar calls bat, bat calls bar, etc.

  // it('checks attribute extraction -- simple', () => {
  //   const too = `
  //   attribute bool check;
  //   uniform float oneUniform;
  //   int foo = 3;
  //   `

  //   const shader = `
  //   import 'too.glsl'
  //   `

  //   const correctResult = '{"check":{"instanced":false}}'
  //   shaderLibrary.setShaderModule('too.glsl', too)
  //   const result = shaderLibrary.parseShader('shader.glsl', shader)

  //   expect(JSON.stringify(result.attributes)).toBe(correctResult)
  // })
  // it('checks uniforms extraction -- simple', () => {
  //   const too = `
  //   attribute bool check;
  //   uniform float oneUniform;
  //   int foo = 3;
  //   `

  //   const shader = `
  //   import 'too.glsl'
  //   `

  //   const correctResult = '{"oneUniform":6}'
  //   shaderLibrary.setShaderModule('too.glsl', too)
  //   const result = shaderLibrary.parseShader('shader.glsl', shader)

  //   expect(JSON.stringify(result.uniforms)).toBe(correctResult)
  // })
  // it('checks uniforms instancedattribute -- simple', () => {
  //   const boo = `
  //   instancedattribute bool check;
  //   uniform float oneUniform;
  //   int foo = 3;
  //   `

  //   const shader = `
  //   import 'boo.glsl'
  //   `

  //   const correctResult = '{"check":{"instanced":true}}'
  //   shaderLibrary.setShaderModule('boo.glsl', boo)
  //   const result = shaderLibrary.parseShader('shader.glsl', shader)

  //   expect(JSON.stringify(result.attributes)).toBe(correctResult)
  // })

  /*
    Tests for different types of uniforms including Color, which is an alias for vec4
  */

  it('checks uniforms extraction -- vec4 type', () => {
    const code = `

    uniform vec4 x;
    `
    const correctResult = { x: Vec4 }
    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
  it('checks uniforms extraction -- color type', () => {
    const code = `

    uniform color x;
    `
    const correctResult = { x: Color }
    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
  it('checks uniforms extraction -- color -> vec4', () => {
    const code = `uniform color x;`
    const correctResult = `uniform vec4 x;
    `

    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(JSON.stringify(result.glsl.trim())).toBe(JSON.stringify(correctResult.trim()))
  })
  it('checks uniforms extraction -- color type', () => {
    const code = `

    uniform color x;
    `
    const correctResult = { x: Color }
    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
})
