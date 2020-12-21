import { StringFunctions } from '../Utilities/StringFunctions';
import { glslTypes } from './GLSLConstants.js';
/** Class representing a shader library.
 * @private
 */
class ShaderLibrary {
    __shaderModules: any;
    /**
     * Create a shader library.
     */
    constructor() {
        this.__shaderModules = {};
    }
    /**
     * The hasShaderModule method.
     * @param {string} shaderName - The shader name.
     * @return {any} - The return value.
     */
    hasShaderModule(shaderName: any) {
        return shaderName in this.__shaderModules;
    }
    /**
     * The setShaderModule method.
     * @param {string} shaderName - The shader name.
     * @param {any} shader - The shader value.
     * @return {any} - The return value.
     */
    setShaderModule(shaderName: any, shader: any) {
        // console.log("setShaderModule:" + shaderName);
        return this.parseShader(shaderName, shader);
    }
    /**
     * The getShaderModule method.
     * @param {string} shaderName - The shader name.
     * @return {any} - The return value.
     */
    getShaderModule(shaderName: any) {
        return this.__shaderModules[shaderName];
    }
    /**
     * The getShaderModuleNames method.
     * @return {any} - The return value.
     */
    getShaderModuleNames() {
        const shaderNames = [];
        for (const shaderName in this.__shaderModules)
            shaderNames.push(shaderName);
        return shaderNames;
    }
    /**
     * The parseShader method.
     * @param {string} shaderName - The shader name.
     * @param {any} glsl - The glsl param.
     * @return {any} - The return value.
     */
    parseShader(shaderName: any, glsl: any) {
        const parsePath = (path: any) => {
            // An absolute path
            if (path.startsWith('..')) {
                const parentFolder = fileFolder.substring(0, fileFolder.lastIndexOf('/'));
                return parentFolder + path.substring(2);
            }
            else if (path.startsWith('.'))
                return fileFolder + path.substring(1);
            else if (path.startsWith('/'))
                return path.substring(1);
            else
                return path;
        };
        // console.log("parseShader:" + shaderName);
        const shaderNameHash = StringFunctions.hashStr(shaderName);
        const fileFolder = shaderName.substring(0, shaderName.lastIndexOf('/'));
        const lines = glsl.split('\n');
        const result = {
            glsl: ' //starting:' + shaderName + '\n',
            lines: lines,
            numLines: 0,
            includeMetaData: [],
            uniforms: {},
            attributes: {},
        };
        const WHITESPACE_RE = /\s+/;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let trimmedline = line.trim();
            if (trimmedline.startsWith('//') || trimmedline.startsWith('*')) {
                result.glsl = result.glsl + line + '\n';
                result.numLines++;
                continue;
            }
            if (trimmedline.includes('//')) {
                trimmedline = trimmedline.slice(0, trimmedline.indexOf('//')).trim();
            }
            if (trimmedline.startsWith('<%') || trimmedline.startsWith('</%')) {
                const parseTag = function (line: any) {
                    if (line.startsWith('</%'))
                        line = line.slice(3);
                    else
                        line = line.slice(2);
                    if (line.endsWith('/>'))
                        line = line.slice(0, line.length - 2);
                    else
                        line = line.slice(0, line.length - 1);
                    const parts = line.split(WHITESPACE_RE);
                    const tag = parts.shift();
                    const result = {
                        tag: tag,
                        attributes: {},
                    };
                    for (const attr of parts) {
                        const pairs = attr.split('=');
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        result.attributes[pairs[0]] = pairs[1].replace(/['"]+/g, '');
                    }
                    return result;
                };
                const elements = parseTag(lines[i].trim());
                switch (elements.tag) {
                    case 'include': {
                        const includeFile = parsePath((elements.attributes as any).file);
                        if (!this.hasShaderModule(includeFile)) {
                            throw new Error('Error while parsing :' +
                                shaderName +
                                ' \nShader module not found:' +
                                includeFile +
                                '\n in:' +
                                this.getShaderModuleNames());
                        }
                        const shaderModule = this.getShaderModule(includeFile);
                        const includedModuleHash = StringFunctions.hashStr((elements.attributes as any).file);
                        let includedGLSL = shaderModule.glsl;
                        // Remove the first line of GLSL, and replace it with the line tag.
                        includedGLSL = includedGLSL.substring(includedGLSL.indexOf('\n') + 1);
                        result.glsl = result.glsl + ' //including:' + (elements.attributes as any).file + '\n';
                        const repl = {};
                        for (const key in elements.attributes) {
                            if (key == 'file')
                                continue;
                            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                            const value = elements.attributes[key];
                            includedGLSL = StringFunctions.replaceAll(includedGLSL, key, value);
                            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                            repl[key] = value;
                        }
                        result.glsl = result.glsl + includedGLSL;
                        result.includeMetaData.push({
                            // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
                            src: result.numLines,
                            // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
                            tgt: i,
                            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
                            length: shaderModule.numLines,
                            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
                            key: includeFile,
                        });
                        // Add line number tag to GLSL so that the GLSL error messages have the correct file name and line number.
                        result.glsl = result.glsl + ' //continuing:' + shaderName + '\n';
                        result.numLines += shaderModule.numLines + 1;
                        for (const name in shaderModule.attributes) {
                            let newname = name;
                            for (const key in repl)
                                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                                newname = StringFunctions.replaceAll(newname, key, repl[key]);
                            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                            result.attributes[newname] = shaderModule.attributes[name];
                        }
                        for (const name in shaderModule.uniforms) {
                            let newname = name;
                            for (const key in repl)
                                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                                newname = StringFunctions.replaceAll(newname, key, repl[key]);
                            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                            result.uniforms[newname] = shaderModule.uniforms[name];
                        }
                        break;
                    }
                    default: {
                        console.warn('Error while parsing :' + shaderName + ' \nUnhandled line:' + line);
                        continue;
                    }
                }
            }
            else {
                const parseAttr = (parts: any, instanced: any) => {
                    if (!(parts[1] in glslTypes))
                        throw new Error('Error while parsing :' + shaderName + ' \nType not recognized:' + parts[1]);
                    const name = parts[2].slice(0, parts[2].length - 1);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    result.attributes[name] = {
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        type: glslTypes[parts[1]],
                        instanced: instanced,
                    };
                    // console.log('attributes:' + name + ":" + parts[1]);
                    if (parts[1] == 'color') {
                        parts[1] = 'vec4';
                        line = parts.join(' ');
                    }
                };
                if (trimmedline.startsWith('struct')) {
                    let membersStr = '';
                    if (trimmedline.includes('}')) {
                        membersStr = trimmedline.substring(trimmedline.indexOf('{') + 1, trimmedline.indexOf('}') - 1);
                    }
                    else {
                        i++;
                        while (true) {
                            line += lines[i] + '\n';
                            membersStr += line.trim();
                            i++;
                            if (membersStr.includes('}'))
                                break;
                        }
                    }
                    const structMembers = membersStr.substring(membersStr.indexOf('{') + 1, membersStr.indexOf('}') - 1);
                    const members = structMembers.split(';');
                    const structDesc = [];
                    for (const member of members) {
                        if (member.length == 0)
                            continue;
                        const memberparts = member.trim().split(WHITESPACE_RE);
                        structDesc.push({
                            name: memberparts[1],
                            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                            type: glslTypes[memberparts[0]],
                        });
                    }
                    const parts = trimmedline.split(WHITESPACE_RE);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    glslTypes[parts[1]] = structDesc;
                }
                if (trimmedline.startsWith('attribute')) {
                    const parts = trimmedline.split(WHITESPACE_RE);
                    parseAttr(parts, false);
                }
                if (trimmedline.startsWith('instancedattribute')) {
                    const parts = trimmedline.split(WHITESPACE_RE);
                    parseAttr(parts, true);
                    parts[0] = 'attribute';
                    line = parts.join(' ');
                }
                else if (trimmedline.startsWith('uniform')) {
                    const parts = trimmedline.split(WHITESPACE_RE);
                    // When a precision qualifier exists in the uniform definition.
                    // e.g. uniform highp int instancesTextureSize;
                    let typeIndex = 1;
                    if (parts.length == 4)
                        typeIndex = 2;
                    const typeName = parts[typeIndex];
                    if (!(typeName in glslTypes))
                        throw new Error('Error while parsing :' + shaderName + ' \nType not recognized:' + parts[1]);
                    const name = parts[typeIndex + 1].slice(0, parts[typeIndex + 1].length - 1);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    result.uniforms[name] = glslTypes[typeName];
                    // console.log('uniform:', name, ":", typeName);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    if (result.uniforms[name] == 'struct') {
                        console.log(parts);
                    }
                    if (parts[1] == 'color') {
                        parts[1] = 'vec4';
                        line = parts.join(' ');
                    }
                }
                result.glsl = result.glsl + line + '\n';
                result.numLines++;
            }
        }
        this.__shaderModules[shaderName] = result;
        return result;
    }
}
const shaderLibrary = new ShaderLibrary();
export { shaderLibrary };
