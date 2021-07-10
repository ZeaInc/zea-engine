import { glslTypes } from './GLSLConstants.js'

/*
  regex variables
*/
const WHITESPACE_RE = /\s+/

/** Class representing a shader library.
 * @private
 */
class ShaderLibrary {
  /**
   * Create a shader library.
   */
  constructor() {
    this.__shaderModules = {}
    this.__shaderSnippet = {}
    this.__cachedShaderSnippetInfo = {}
  }

  /**
   * The hasShaderModule method.
   * @param {string} shaderName - The shader name.
   * @return {boolean} - The return value.
   */
  hasShaderModule(shaderName) {
    return shaderName in this.__shaderModules
  }

  /**
   * The setShaderModule method.
   * @param {string} shaderName - The shader name.
   * @param {string} shader - The shader GLSL.
   * @return {boolean} - The return value.
   */
  setShaderModule(shaderName, shader) {
    return this.parseShader(shaderName, shader)
  }
  // eslint-disable-next-line require-jsdoc
  setShaderSnippet(shaderName, shader) {
    this.__shaderSnippet[shaderName] = shader
  }
  /**
   * The getShaderModule method.
   * @param {string} shaderName - The shader name.
   * @return {any} - The return value.
   */
  getShaderModule(shaderName) {
    return this.__shaderModules[shaderName]
  }

  /**
   * The getShaderModuleNames method.
   * @return {array} - The return value.
   */
  getShaderModuleNames() {
    const shaderNames = []
    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__shaderModules) shaderNames.push(shaderName)
    return shaderNames
  }

  /**
   * The parsePath method.
   * @param {string} path - path of import
   * @param {string} fileFolder - absolute path
   * @return {string} - The return value.
   */
  parsePath(path, fileFolder) {
    // An absolute path
    if (path.startsWith('..')) {
      const parentFolder = fileFolder.substring(0, fileFolder.lastIndexOf('/'))
      return parentFolder + path.substring(2)
    } else if (path.startsWith('.')) return fileFolder + path.substring(1)
    else if (path.startsWith('/')) return path.substring(1)
    else return path
  }

  /**
   * The parseAttr
   * @param {string} parts - parts
   * @param {bool} instanced - instanced
   * @param {object} result - result object to store parsed data
   */
  parseAttr(parts, instanced, result) {
    // see if type is valid
    if (!(parts[1] in glslTypes)) {
      throw new Error('Error while parsing :' + shaderName + ' \nType not recognized:' + parts[1])
    }

    const name = parts[2].slice(0, parts[2].length - 1)
    result.attributes[name] = {
      type: glslTypes[parts[1]],
      instanced: instanced,
    }

    // console.log('attributes:' + name + ":" + parts[1]);
    if (parts[1] == 'color') {
      parts[1] = 'vec4'
      line = parts.join(' ')
    }
  }

  /**
   * The parseShader method.
   * @param {string} shaderName - The shader name.
   * @param {string} glsl - The glsl param.
   * @return {object} - returns the 'result' object
   */
  parseShader(shaderName, glsl) {
    return this.parseShaderHelper(shaderName, glsl, [], 0)
  }

  /**
   * The addLine method - adds parsed glsl lines into the returned result object
   * @param {string} result - result object that has the glsl to add to
   * @param {string} line - the current line that is to be added.
   */
  addLine(result, line) {
    result.glsl = result.glsl + line + '\n'
    result.numLines++
  }
  /**
   * The parseShader recursive helper method
   * @param {string} shaderName - The shader name.
   * @param {string} glsl - The glsl param.
   * @param {array} includes - keep track of what was included
   * @param {int} lineNumber - keep track of what line we're on
   * @return {object} - The return value.
   */
  parseShaderHelper(shaderName, glsl, includes, lineNumber) {
    // console.log("parseShader:" + shaderName);
    glsl = glsl.toString() // TODO: remove ideally, this cast is here just to make jest pass
    const fileFolder = shaderName.substring(0, shaderName.lastIndexOf('/'))
    const lines = glsl.split('\n') // break up code by newlines

    const result = {
      glsl: '',
      numLines: 0,
      includeMetaData: [],
      uniforms: {},
      attributes: {},
    }

    // go through each line of a GLSL file
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      const trimmedLine = line.trim()

      // TODO: should handle no space after '//' case and '//' after statement IF you want to remove comments
      // if (trimmedLine.includes('//')) {
      //   trimmedLine = trimmedLine.slice(0, trimmedLine.indexOf('//')).trim()
      // }

      // Get first token of a statement and switch
      const parts = trimmedLine.split(WHITESPACE_RE)
      const firstToken = parts[0]
      switch (firstToken) {
        // handle comment lines -- if they aren't going to be removed, no need for the below code.
        // case '/*':
        // case '*':
        // case '//': {
        //   continue
        // }
        case 'import': {
          const relativeFileLoc = trimmedLine.split(/'|"|`/)[1]
          const includeFile = this.parsePath(relativeFileLoc, fileFolder)

          if (includeFile in this.__shaderSnippet) {
            const includedGLSL = this.__shaderSnippet[includeFile] // get glsl snippet code to add
            // recursively includes glsl snippets
            const reursiveResult = this.parseShaderHelper(shaderName, includedGLSL, includes, lineNumber)

            // adding code + snippet glsl, if not already added.
            if (!includes.includes(includeFile)) {
              includes.push(includeFile) // keep track of imports
              result.glsl = result.glsl + reursiveResult.glsl
              result.numLines += reursiveResult.numLines

              // TODO: find a cleaner way to combine objects
              // should have accumulator obj to combine here. result can be cached then combined with accumulator
              result.uniforms = {
                ...result.uniforms,
                ...reursiveResult.uniforms,
              }
              result.attributes = {
                ...result.attributes,
                ...reursiveResult.attributes,
              }
              result.includeMetaData = {
                ...result.includeMetaData,
                ...reursiveResult.includeMetaData,
              }
              // console.log('includes: ' + includes)
            } else {
              console.log('already included: ' + includeFile)
            }

            // console.log('\n glsl snippet: ' + reursiveResult.glsl) // print out snippets
          } else {
            // throw new Error(shaderName + ': SNIPPET NOT FOUND: ' + includeFile)
            console.log('shaderName: ' + shaderName)
            console.log('SNIPPET NOT FOUND: ' + includeFile)
          }

          // continue // avoid adding lines
          break
        }
        case 'attribute': {
          this.parseAttr(parts, false, result)
          this.addLine(result, line)
          break
        }
        case 'instancedattribute': {
          this.parseAttr(parts, true, result)
          parts[0] = 'attribute'
          line = parts.join(' ')
          this.addLine(result, line)
          break
        }
        case 'uniform': {
          // When a precision qualifier exists in the uniform definition.
          // e.g. uniform highp int instancesTextureSize;
          let typeIndex = 1
          if (parts.length == 4) typeIndex = 2
          const typeName = parts[typeIndex]
          if (!(typeName in glslTypes))
            throw new Error('Error while parsing :' + shaderName + ' \nType not recognized:' + parts[1])
          const name = parts[typeIndex + 1].slice(0, parts[typeIndex + 1].length - 1)

          if (name.includes('[')) {
            // Strip off the square brackets.
            result.uniforms[name.substring(0, name.indexOf('['))] = glslTypes[typeName]
          } else {
            result.uniforms[name] = glslTypes[typeName]
          }

          if (result.uniforms[name] == 'struct') {
            console.log(parts)
          }
          if (parts[1] == 'color') {
            parts[1] = 'vec4'
            line = parts.join(' ')
          }
          this.addLine(result, line)
          break
        }
        case 'struct': {
          let membersStr = ''
          if (trimmedLine.includes('}')) {
            membersStr = trimmedLine.substring(trimmedLine.indexOf('{') + 1, trimmedLine.indexOf('}') - 1)
          } else {
            i++
            while (true) {
              line += lines[i] + '\n'
              membersStr += line.trim()
              i++
              if (membersStr.includes('}')) break
            }
          }
          const structMembers = membersStr.substring(membersStr.indexOf('{') + 1, membersStr.indexOf('}') - 1)
          const members = structMembers.split(';')
          const structDesc = []
          for (const member of members) {
            if (member.length == 0) continue
            const memberparts = member.trim().split(WHITESPACE_RE)
            structDesc.push({
              name: memberparts[1],
              type: glslTypes[memberparts[0]],
            })
          }
          glslTypes[parts[1]] = structDesc
          this.addLine(result, line)
          break
        }
        default: {
          // all other statements
          this.addLine(result, line)
        }
      } // end of switch
    } // end of forloop

    // console.log('length of shader: ' + result.numLines)
    // console.log(result.glsl)
    // this.__shaderModules[shaderName] = result
    return result
  }
}
export const shaderLibrary = new ShaderLibrary()
