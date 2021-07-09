import { StringFunctions } from '../Utilities/StringFunctions'
import { glslTypes } from './GLSLConstants.js'

/*
  regex variables
*/
const WHITESPACE_RE = /\s+/
const regexImport = new RegExp('import (\'|").*(\'|")') // for testing import statements.

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
    // TODO: just add
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
   * The handleImport method.
   * @param {string} shaderName - The shader name.
   * @param {string} fileFolder - The glsl param.
   * @param {string} trimmedLine - line with the import statement
   * @param {object} result - result object to modify
   * @param {int} i - The loop iteration variable i
   */
  handleImport(shaderName, fileFolder, trimmedLine, result, i) {
    const relativeFileLoc = trimmedLine.split(/'|"|`/)[1]
    const includeFile = this.parsePath(relativeFileLoc, fileFolder)
    // this method adds an existing shader module's code to the current glsl.
    if (!this.hasShaderModule(includeFile)) {
      throw new Error(
        'Error while parsing :' +
          shaderName +
          ' \nShader module not found:' +
          includeFile +
          '\n in:' +
          this.getShaderModuleNames()
      )
    }

    const shaderModule = this.getShaderModule(includeFile)
    let includedGLSL = shaderModule.glsl
    includedGLSL = includedGLSL.substring(includedGLSL.indexOf('\n') + 1)
    const repl = {}
    repl['file'] = relativeFileLoc

    result.glsl = result.glsl + includedGLSL
    result.includeMetaData.push({
      src: result.numLines,
      tgt: i,
      length: shaderModule.numLines,
      key: includeFile,
    })

    // Add line number tag to GLSL so that the GLSL error messages have the correct file name and line number.
    result.glsl = result.glsl + ' //continuing:' + shaderName + '\n'
    result.numLines += shaderModule.numLines + 1

    // eslint-disable-next-line guard-for-in
    for (const name in shaderModule.attributes) {
      let newname = name
      // eslint-disable-next-line guard-for-in
      for (const key in repl) newname = StringFunctions.replaceAll(newname, key, repl[key])
      result.attributes[newname] = shaderModule.attributes[name]
    }
    // eslint-disable-next-line guard-for-in
    for (const name in shaderModule.uniforms) {
      let newname = name
      // eslint-disable-next-line guard-for-in
      for (const key in repl) newname = StringFunctions.replaceAll(newname, key, repl[key])
      result.uniforms[newname] = shaderModule.uniforms[name]
    }
  }

  // eslint-disable-next-line require-jsdoc
  parseTag(line) {
    if (line.startsWith('</%')) line = line.slice(3)
    else line = line.slice(2)
    if (line.endsWith('/>')) line = line.slice(0, line.length - 2)
    else line = line.slice(0, line.length - 1)
    const parts = line.split(WHITESPACE_RE)
    const tag = parts.shift()
    const result = {
      tag: tag,
      attributes: {},
    }
    for (const attr of parts) {
      const pairs = attr.split('=')
      result.attributes[pairs[0]] = pairs[1].replace(/['"]+/g, '')
    }
    return result
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
   * @param {any} glsl - The glsl param.
   * @return {any} - The return value.
   */
  parseShader(shaderName, glsl) {
    // console.log("parseShader:" + shaderName);
    glsl = glsl.toString() // TODO: this cast is here just to make jest pass

    // const shaderNameHash = StringFunctions.hashStr(shaderName)
    const fileFolder = shaderName.substring(0, shaderName.lastIndexOf('/'))
    const lines = glsl.split('\n') // break up code by /n

    const result = {
      glsl: '', //' //starting:' + shaderName + '\n',
      lines: lines,
      numLines: 0,
      includeMetaData: [],
      uniforms: {},
      attributes: {},
      imported: [],
    }

    // loop through each line of a GLSL file
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      let trimmedLine = line.trim()

      // handle comment lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        result.glsl = result.glsl + line + '\n'
        result.numLines++
        continue
      }

      // TODO: Deprecated
      if (trimmedLine.startsWith('<%') || trimmedLine.startsWith('</%')) {
        const elements = this.parseTag(lines[i].trim())
        switch (elements.tag) {
          case 'include': {
            const includeFile = this.parsePath(elements.attributes.file, fileFolder)
            if (!this.hasShaderModule(includeFile)) {
              throw new Error(
                'Error while parsing :' +
                  shaderName +
                  ' \nShader module not found:' +
                  includeFile +
                  '\n in:' +
                  this.getShaderModuleNames()
              )
            }

            const shaderModule = this.getShaderModule(includeFile)

            const includedModuleHash = StringFunctions.hashStr(elements.attributes.file)
            let includedGLSL = shaderModule.glsl

            // Remove the first line of GLSL, and replace it with the line tag.
            includedGLSL = includedGLSL.substring(includedGLSL.indexOf('\n') + 1)
            result.glsl = result.glsl + ' //including:' + elements.attributes.file + '\n'

            const repl = {}
            for (const key in elements.attributes) {
              if (key == 'file') continue
              const value = elements.attributes[key]
              includedGLSL = StringFunctions.replaceAll(includedGLSL, key, value)
              repl[key] = value
            }

            result.glsl = result.glsl + includedGLSL
            result.includeMetaData.push({
              src: result.numLines,
              tgt: i,
              length: shaderModule.numLines,
              key: includeFile,
            })

            // Add line number tag to GLSL so that the GLSL error messages have the correct file name and line number.
            result.glsl = result.glsl + ' //continuing:' + shaderName + '\n'
            result.numLines += shaderModule.numLines + 1

            // eslint-disable-next-line guard-for-in
            for (const name in shaderModule.attributes) {
              let newname = name
              // eslint-disable-next-line guard-for-in
              for (const key in repl) newname = StringFunctions.replaceAll(newname, key, repl[key])
              result.attributes[newname] = shaderModule.attributes[name]
            }
            // eslint-disable-next-line guard-for-in
            for (const name in shaderModule.uniforms) {
              let newname = name
              // eslint-disable-next-line guard-for-in
              for (const key in repl) newname = StringFunctions.replaceAll(newname, key, repl[key])
              result.uniforms[newname] = shaderModule.uniforms[name]
            }

            break
          }
          default: {
            console.warn('Error while parsing :' + shaderName + ' \nUnhandled line:' + line)
            continue
          }
        }
        continue
      }

      // handle import statements
      if (regexImport.test(trimmedLine)) {
        this.handleImport(shaderName, fileFolder, trimmedLine, result, i)
        continue
      }
      // handle import statements
      if (false && regexImport.test(trimmedLine)) {
        const relativeFileLoc = trimmedLine.split(/'|"|`/)[1]
        const includeFile = this.parsePath(relativeFileLoc, fileFolder)

        if (includeFile in this.__shaderSnippet) {
          const includedGLSL = this.__shaderSnippet[includeFile] // glsl code to add
          const reursiveResult = this.parseShader(shaderName, includedGLSL)
          result.imported = result.imported.concat(reursiveResult.imported)
          // update result/shaderModule
          console.log('includeFile: ' + includeFile)
          console.log('imported list: ' + result.imported)
          console.log('imported test: ' + result.imported.includes(includeFile))
          if (!result.imported.includes(includeFile)) {
            result.imported.push(includeFile)
            result.glsl =
              result.glsl +
              '\n//INJECTED: ' +
              includeFile +
              '\n' +
              reursiveResult.glsl +
              '\n//INECTED END: ' +
              includeFile +
              '\n'
          }

          // console.log('\n glsl snippet: ' + reursiveResult.glsl) // print out snippets
        } else {
          // throw new Error('SNIPPET NOT FOUND')
          console.log('shaderName: ' + shaderName)
          console.log('SNIPPET NOT FOUND: ' + includeFile)
        }

        continue
      }

      // handle comments after statements
      if (trimmedLine.includes('//')) {
        trimmedLine = trimmedLine.slice(0, trimmedLine.indexOf('//')).trim()
      }

      // handle structs
      if (trimmedLine.startsWith('struct')) {
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
        const parts = trimmedLine.split(WHITESPACE_RE)
        glslTypes[parts[1]] = structDesc
      }

      // handle attributes
      if (trimmedLine.startsWith('attribute')) {
        const parts = trimmedLine.split(WHITESPACE_RE)
        this.parseAttr(parts, false, result)
      }

      // handle instanced attributes
      if (trimmedLine.startsWith('instancedattribute')) {
        const parts = trimmedLine.split(WHITESPACE_RE)
        this.parseAttr(parts, true, result)
        parts[0] = 'attribute'
        line = parts.join(' ')
      } else if (trimmedLine.startsWith('uniform')) {
        const parts = trimmedLine.split(WHITESPACE_RE)

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
      }

      result.glsl = result.glsl + line + '\n'
      result.numLines++
    }

    console.log('IMPORTS: ' + shaderName + ' ' + result.imported)
    this.__shaderModules[shaderName] = result
    return result
  }
}
export const shaderLibrary = new ShaderLibrary()
