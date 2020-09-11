import { BaseItem } from '../SceneTree/BaseItem'
import { StringFunctions } from '../Utilities/StringFunctions'

// Every instance of every shader should have a unique id.
// This is so that we can uniquely identify the bound shader during
// rendering. Materials and geometries cache bindings to shaders.
// And need the id to be unique. (Note: we used to use the constructor.name
// which was only unique if the same shader was constructed once, and
// never unique in release mode after the port to Rollup)
let shaderInstanceId = 0

/** Class representing a GL shader.
 * @extends BaseItem
 * @private
 */
class GLShader extends BaseItem {
  /**
   * Create a GL shader.
   * @param {any} gl - The gl value.
   */
  constructor(gl, name) {
    super(name)
    if (!gl) {
      throw new Error('gl context must be passed to shader constructor')
    }
    this.__gl = gl
    this.__shaderStages = {
      VERTEX_SHADER: {
        glsl: '',
        lines: 0,
        uniforms: {},
        attributes: {},
      },
      FRAGMENT_SHADER: {
        glsl: '',
        lines: 0,
        uniforms: {},
        attributes: {},
      },
    }

    this.__shaderProgramHdls = {}
    this.__gltextures = {}

    this.__id = shaderInstanceId++

    this.invisibleToGeomBuffer = false
  }

  /**
   * The isTransparent method.
   * @return {boolean} - The return value.
   */
  static isTransparent() {
    return false
  }

  /**
   * The isOverlay method.
   * @return {boolean} - The return value.
   */
  static isOverlay() {
    return false
  }

  // /////////////////////////////////
  // Compilation

  /**
   * The __compileShaderStage method.
   * @param {any} glsl - The glsl value.
   * @param {any} stageID - The stageID value.
   * @param {string} name - The name value.
   * @param {any} shaderopts - The shaderopts value.
   * @return {any} - The return value.
   * @private
   */
  __compileShaderStage(glsl, stageID, name, shaderopts) {
    const gl = this.__gl
    // console.log("__compileShaderStage:" + this.name+"."+name + " glsl:\n" + glsl);
    if (!shaderopts) shaderopts = gl.shaderopts
    if (shaderopts) {
      if (shaderopts.repl) {
        for (const key in shaderopts.repl) glsl = StringFunctions.replaceAll(glsl, key, shaderopts.repl[key])
      }
      if (shaderopts.defines) glsl = shaderopts.defines + glsl
    }

    let prefix
    if (gl.name == 'webgl2') {
      glsl = StringFunctions.replaceAll(glsl, 'attribute', 'in')
      if (name == 'vertexShader') glsl = StringFunctions.replaceAll(glsl, 'varying', 'out')
      else glsl = StringFunctions.replaceAll(glsl, 'varying', 'in')
      glsl = StringFunctions.replaceAll(glsl, 'texture2D', 'texture')

      prefix = '#version 300 es\n'
      glsl = prefix + glsl
    }

    const shaderHdl = gl.createShader(stageID)
    gl.shaderSource(shaderHdl, glsl)

    // Compile the shader program.
    gl.compileShader(shaderHdl)

    // See if it compiled successfully
    if (!gl.getShaderParameter(shaderHdl, gl.COMPILE_STATUS)) {
      console.log('Errors in :' + this.constructor.name)
      const errors = gl.getShaderInfoLog(shaderHdl).split('\n')
      const errorLines = {}
      for (let i in errors) {
        if (errors[i].startsWith("'")) {
          errors[i - 1] = errors[i - 1] + errors[i]
          delete errors[i]
          i--
          continue
        }
        const parts = errors[i].split(':')
        if (parts.length >= 2) {
          const lineNum = parseInt(parts[2]) // TODO check against ATI and intel cards
          if (!isNaN(lineNum)) {
            if (errorLines[lineNum]) errorLines[lineNum].push(errors[i])
            else errorLines[lineNum] = [errors[i]]
          }
        }
      }
      const numberedLinesWithErrors = []
      const lines = glsl.split('\n')
      for (let i = 0; i < lines.length; i++) {
        numberedLinesWithErrors.push((i + 1 + ':').padStart(' ', 3) + lines[i])
        if (i + 1 in errorLines) {
          const errors = errorLines[i + 1]
          for (const error of errors) {
            numberedLinesWithErrors.push(error)
            numberedLinesWithErrors.push('-'.padStart('-', error.length))
          }
        }
      }
      // throw("An error occurred compiling the shader \n\n" + numberedLinesWithErrors.join('\n') + "\n\n=================\n" + this.constructor.name + "." + name + ": \n\n" + errors.join('\n'));
      throw new Error(
        'An error occurred compiling the shader \n=================\n' +
          this.constructor.name +
          '.' +
          name +
          ': \n\n' +
          errors.join('\n') +
          '\n' +
          numberedLinesWithErrors.join('\n')
      )
      return null
    }
    return shaderHdl
  }

  /**
   * The __createProgram method.
   * @param {any} shaderopts - The shaderopts value.
   * @return {any} - The return value.
   * @private
   */
  __createProgram(shaderopts) {
    const gl = this.__gl
    this.__shaderCompilationAttempted = true
    const shaderProgramHdl = gl.createProgram()
    const vertexShaderGLSL = this.__shaderStages['VERTEX_SHADER'].glsl
    const shaderHdls = {}
    if (vertexShaderGLSL != undefined) {
      const vertexShader = this.__compileShaderStage(vertexShaderGLSL, gl.VERTEX_SHADER, 'vertexShader', shaderopts)
      if (!vertexShader) {
        return false
      }
      gl.attachShader(shaderProgramHdl, vertexShader)
      shaderHdls[gl.VERTEX_SHADER] = vertexShader
    }
    const fragmentShaderGLSL = this.__shaderStages['FRAGMENT_SHADER'].glsl
    if (fragmentShaderGLSL != undefined) {
      const fragshaderopts = Object.assign({}, gl.shaderopts, shaderopts)
      if (fragshaderopts.frag) fragshaderopts.defines = fragshaderopts.frag.defines + fragshaderopts.defines
      const fragmentShader = this.__compileShaderStage(
        fragmentShaderGLSL,
        gl.FRAGMENT_SHADER,
        'fragmentShader',
        fragshaderopts
      )
      if (!fragmentShader) {
        return false
      }
      gl.attachShader(shaderProgramHdl, fragmentShader)
      shaderHdls[gl.FRAGMENT_SHADER] = fragmentShader
    }
    gl.linkProgram(shaderProgramHdl)

    if (!gl.getProgramParameter(shaderProgramHdl, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(shaderProgramHdl)

      if (info.includes('D3D shader compilation failed')) {
        // Usefull for debugging very nasty compiler errors generated only in the ANGL layer.
        const debug_ext = gl.getExtension('WEBGL_debug_shaders')
        if (debug_ext) {
          const hlsl = debug_ext.getTranslatedShaderSource(shaderHdls[gl.VERTEX_SHADER])
          console.log(hlsl)
        }
      }

      console.log('vertexShaderGLSL:' + vertexShaderGLSL)
      console.log('fragmentShaderGLSL:' + fragmentShaderGLSL)
      throw new Error('Unable to link the shader program:' + this.constructor.name + '\n==================\n' + info)

      gl.deleteProgram(shaderProgramHdl)
      return false
    }

    const result = this.__extractAttributeAndUniformLocations(shaderProgramHdl, shaderopts)
    result.shaderProgramHdl = shaderProgramHdl
    return result
  }

  /**
   * The __extractAttributeAndUniformLocations method.
   * @param {any} shaderProgramHdl - The shaderProgramHdl value.
   * @param {any} shaderopts - The shaderopts value.
   * @return {any} - The return value.
   * @private
   */
  __extractAttributeAndUniformLocations(shaderProgramHdl, shaderopts) {
    const gl = this.__gl
    const attrs = this.getAttributes()
    const result = {
      attrs: {},
      unifs: {},
    }
    for (const attrName in attrs) {
      const location = gl.getAttribLocation(shaderProgramHdl, attrName)
      if (location == undefined) {
        console.warn('Shader attribute not found:' + attrName)
        continue
      }
      const attrDesc = attrs[attrName]
      result.attrs[attrName] = {
        name: attrName,
        location: location,
        type: attrDesc.type,
        instanced: attrDesc.instanced,
      }
    }
    const unifs = this.getUniforms()
    for (let uniformName in unifs) {
      const unifType = unifs[uniformName]
      if (unifType instanceof Array) {
        for (const member of unifType) {
          const structMemberName = uniformName + '.' + member.name
          const location = gl.getUniformLocation(shaderProgramHdl, structMemberName)
          if (location == undefined) {
            // console.warn(this.constructor.name + " uniform found in shader code but not in compiled program:" + uniformName);
            continue
          }
          result.unifs[structMemberName] = {
            name: structMemberName,
            location: location,
            type: member.type,
          }
        }
      }
      if (shaderopts) {
        if (shaderopts.repl) {
          for (const key in shaderopts.repl) uniformName = uniformName.replace(key, shaderopts.repl[key])
        }
      }

      const location = gl.getUniformLocation(shaderProgramHdl, uniformName)
      if (location == undefined) {
        // console.warn(this.constructor.name + " uniform found in shader code but not in compiled program:" + uniformName);
        continue
      }
      result.unifs[uniformName] = {
        name: uniformName,
        location: location,
        type: unifType,
      }
    }
    return result
  }

  /**
   * The getAttributes method.
   * @return {any} - The return value.
   */
  getAttributes() {
    const attributes = {}
    for (const stageName in this.__shaderStages) {
      const shaderStageBlock = this.__shaderStages[stageName]
      for (const attrName in shaderStageBlock['attributes'])
        attributes[attrName] = shaderStageBlock['attributes'][attrName]
    }
    return attributes
  }

  /**
   * The getUniforms method.
   * @return {any} - The return value.
   */
  getUniforms() {
    const uniforms = {}
    for (const stageName in this.__shaderStages) {
      const shaderStageBlock = this.__shaderStages[stageName]
      for (const unifName in shaderStageBlock['uniforms']) uniforms[unifName] = shaderStageBlock['uniforms'][unifName]
    }
    return uniforms
  }

  /**
   * The finalize method.
   */
  finalize() {}

  /**
   * The compileForTarget method.
   * @param {any} key - The key value.
   * @param {any} shaderopts - The shaderopts value.
   * @return {any} - The return value.
   */
  compileForTarget(key, shaderopts) {
    const shaderkey = key ? this.__id + key : this.__id
    let shaderCompilationResult = this.__shaderProgramHdls[shaderkey]
    if (!shaderCompilationResult) {
      if (shaderCompilationResult !== false) {
        shaderCompilationResult = this.__createProgram(shaderopts)
        shaderCompilationResult.shaderkey = shaderkey
        this.__shaderProgramHdls[shaderkey] = shaderCompilationResult
      }
    }
    return shaderCompilationResult
  }

  /**
   * The compile method.
   */
  compile() {
    this.compileForTarget()
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} key - The key value.
   * @return {any} - The return value.
   */
  bind(renderstate, key) {
    const gl = this.__gl

    if (renderstate.glshader != this) {
      const shaderCompilationResult = this.compileForTarget(key, renderstate.shaderopts)
      if (shaderCompilationResult === false) {
        console.warn(this.constructor.name + ' is not compiled for ' + key)
        return false
      }

      const shaderProgramHdl = shaderCompilationResult.shaderProgramHdl

      gl.useProgram(shaderProgramHdl)
      renderstate.glshader = this
      renderstate.shaderkey = shaderCompilationResult.shaderkey
      renderstate.unifs = shaderCompilationResult.unifs
      renderstate.attrs = shaderCompilationResult.attrs

      renderstate.boundTextures = 0
      // Make sure we clear the binding cached.
      renderstate.glgeom = undefined

      // Once the shader has been bound, we allow the renderer to bind any
      // of its global uniform values. (e.g. env map values etc...)
      if (renderstate.bindRendererUnifs) renderstate.bindRendererUnifs(shaderCompilationResult.unifs)
    }

    renderstate.supportsInstancing = true

    return true
  }

  /**
   * The unbind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  unbind(renderstate) {
    return true
  }

  // /////////////////////////////
  // Parameters

  /**
   * The getParamDeclarations method.
   * @return {any} - The return value.
   */
  static getParamDeclarations() {
    return []
  }

  /**
   * The getGeomDataShaderName method.
   */
  static getGeomDataShaderName() {}

  /**
   * The getSelectedShaderName method.
   */
  static getSelectedShaderName() {}

  // /////////////////////////////////
  // Destroy

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    const gl = this.__gl
    for (const key in this.__shaderProgramHdls) {
      const shaderCompilationResult = this.__shaderProgramHdls[key]
      gl.deleteProgram(shaderCompilationResult.shaderProgramHdl)
    }
    this.__shaderProgramHdls = {}
  }
}

export { GLShader }
