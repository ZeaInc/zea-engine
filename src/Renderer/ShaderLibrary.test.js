import { shaderLibrary } from './ShaderLibrary'
import glslTypes from '../Renderer/GLSLConstants'
import { Vec2, Vec3, Vec4, Mat3, Mat4, Color } from '../Math/index'
import { BaseImage } from '../SceneTree/BaseImage'
import { SInt32, UInt32, Float32 } from '../Utilities/MathFunctions'
// import { BaseImage } from '../SceneTree/BaseImage.js'
// import { SInt32, UInt32, Float32 } from '../Utilities/MathFunctions'

/**
 * The miniParser function - removes newlines and whitespaces from a string for testing.
 * @param {string} str - a string
 * @return {string} - The unparsed shader GLSL.
 */
function miniParser(str) {
  const lines = str.split('\n')
  let result = ''
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    line = line.trim()
    if (line !== '') {
      result = result + line
    }
  }
  return result
}

describe('ShaderLibrary imports', () => {
  it('test simple import', () => {
    const foo = `
    int foo = 3;
    `
    const shader = `
    import 'foo.glsl'
    `
    const correctResult = `
    int foo = 3;
    `
    shaderLibrary.setShaderModule('foo.glsl', foo)
    const result = shaderLibrary.parseShader('shader.glsl', shader)

    expect(miniParser(result.glsl)).toBe(miniParser(correctResult))
  })

  it('test importing duplicate snippets', () => {
    const foo = `
    int foo = 3;
    `
    const bar = `
    import 'foo.glsl'
    int bar = 21;
    `
    const shader = `
    import 'foo.glsl'
    import 'bar.glsl'
    `
    const correctResult = `
    int foo = 3;
    int bar = 21;
    `
    shaderLibrary.setShaderModule('foo.glsl', foo)
    shaderLibrary.setShaderModule('bar.glsl', bar)
    const result = shaderLibrary.parseShader('shader.glsl', shader)

    expect(miniParser(result.glsl)).toMatch(miniParser(correctResult))
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
    shaderLibrary.setShaderModule('bat.glsl', bat)
    const result = shaderLibrary.parseShader('bat.glsl', bat)

    expect(miniParser(result.glsl)).toBe(miniParser(correctResult))
  })
  it('import self -- two node cycle', () => {
    const bat = `
    import 'leaf.glsl'
    int bat = 21;
    `
    const leaf = `
    import 'bat.glsl'
    `
    const correctResult = `
    int bat = 21;
    `
    shaderLibrary.setShaderModule('leaf.glsl', leaf)
    shaderLibrary.setShaderModule('bat.glsl', bat)
    const result = shaderLibrary.parseShader('bat.glsl', bat)

    expect(miniParser(result.glsl)).toBe(miniParser(correctResult))
  })
})

describe('ShaderLibrary types', () => {
  it('checks attribute extraction -- simple', () => {
    const too = `
    attribute bool check;
    uniform float oneUniform;
    int foo = 3;
    `
    const shader = `
    import 'too.glsl'
    `

    const correctResult = '{"check":{"instanced":false}}'
    shaderLibrary.setShaderModule('too.glsl', too)
    const result = shaderLibrary.parseShader('shader.glsl', shader)

    expect(JSON.stringify(result.attributes)).toBe(correctResult)
  })

  it('checks uniforms extraction -- Float32', () => {
    const too = `
    attribute bool check;
    uniform float oneUniform;
    int foo = 3;
    `

    const shader = `
    import 'too.glsl'
    `

    const correctResult = { oneUniform: Float32 }
    shaderLibrary.setShaderModule('too.glsl', too)
    const result = shaderLibrary.parseShader('shader.glsl', shader)

    expect(result.uniforms).toEqual(correctResult)
  })

  it('checks uniforms instancedattribute -- bool', () => {
    const boo = `
    instancedattribute bool check;
    uniform float oneUniform;
    int foo = 3;
    `
    const shader = `
    import 'boo.glsl'
    `
    const correctResult = { check: { instanced: true, type: Boolean } }
    shaderLibrary.setShaderModule('boo.glsl', boo)
    const result = shaderLibrary.parseShader('shader.glsl', shader)
    console.log(result.attributes)
    expect(result.attributes).toStrictEqual(correctResult)
  })
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

  it('checks parsed glsl -- color -> vec4', () => {
    const code = `uniform color x;`
    const correctResult = `uniform vec4 x;`
    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(miniParser(result.glsl.trim())).toBe(miniParser(correctResult.trim()))
  })

  it('checks uniforms extraction -- color type', () => {
    const code = `
    uniform color x;
    `
    const correctResult = { x: Color }
    const result = shaderLibrary.parseShader('color.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
  it('checks uniforms extraction -- sampler2D type', () => {
    const code = `
    uniform sampler2D x;
    `
    const correctResult = { x: BaseImage }
    const result = shaderLibrary.parseShader('sampler2D.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
  it('checks uniforms extraction -- samplerCube type', () => {
    const code = `
    uniform samplerCube x;
    `
    const correctResult = { x: BaseImage }
    const result = shaderLibrary.parseShader('sampler2D.glsl', code)
    expect(result.uniforms).toEqual(correctResult)
  })
})
