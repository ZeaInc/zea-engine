/* eslint-disable require-jsdoc */
/* eslint-disable guard-for-in */
import { Vec2, Vec3, Color } from '../Math/index'
import { BaseItem } from './BaseItem.js'
import Registry from '../Registry'
import { Parameter, NumberParameter, Vec2Parameter, Vec3Parameter, ColorParameter } from './Parameters/index'
import MathFunctions from '../Utilities/MathFunctions'

// Explicit export of parameters that are not included in the
// moduled defined by the index file in the folder. (see Parameters/index.js)
// These parameters depend on classes that ar ParameterOwners.
// TOOD: Move to this folder.
import { MaterialFloatParam } from './Parameters/MaterialFloatParam'
import { MaterialColorParam } from './Parameters/MaterialColorParam'

const generateParameterInstance = (paramName, defaultValue, range, texturable) => {
  if (typeof defaultValue == 'boolean' || defaultValue === false || defaultValue === true) {
    return new Parameter(paramName, defaultValue, 'Boolean')
  } else if (typeof defaultValue == 'string') {
    return new Parameter(paramName, defaultValue, 'String')
  } else if (MathFunctions.isNumeric(defaultValue)) {
    if (texturable) return new MaterialFloatParam(paramName, defaultValue, range)
    else return new NumberParameter(paramName, defaultValue, range)
  } else if (defaultValue instanceof Vec2) {
    return new Vec2Parameter(paramName, defaultValue)
  } else if (defaultValue instanceof Vec3) {
    return new Vec3Parameter(paramName, defaultValue)
  } else if (defaultValue instanceof Color) {
    if (texturable) return new MaterialColorParam(paramName, defaultValue)
    else return new ColorParameter(paramName, defaultValue)
  } else {
    return new Parameter(paramName, defaultValue)
  }
}

/**
 * Represents a type of `BaseItem` class that holds material configuration.
 * Use this to apply materials to your assets or item parts.
 *
 * **Events**
 * * **shaderNameChanged:** Triggered when the shader's name is set through `setShaderName` method.
 *
 * @extends BaseItem
 */
class Material extends BaseItem {
  /**
   * Create a material
   * @param {string} name - The name of the material.
   * @param {string} shaderName - Shader's class name.
   */
  constructor(name, shaderName) {
    super(name)
    this.visibleInGeomDataBuffer = true

    if (shaderName) this.setShaderName(shaderName)
  }

  /**
   * Getter for the shader name.
   * @return {string} - Returns the shader name.
   */
  getShaderName() {
    return this.__shaderName
  }

  /**
   * Sets shader by using the name of the class with the script.
   * It is important that the shader is registered in `Registry`, otherwise it will error.
   * See all classes that extend from `GLShader`.
   *
   * @param {string} shaderName - The shader name.
   */
  setShaderName(shaderName) {
    if (this.__shaderName == shaderName) return

    const shaderClass = Registry.getBlueprint(shaderName)
    if (!shaderClass) throw new Error('Error setting Shader. Shader not found:' + shaderName)

    const paramDescs = shaderClass.getParamDeclarations()
    const paramMap = {}
    for (const desc of paramDescs) {
      // Note: some shaders specify default images. Like the speckle texture
      // on the car paint shader.
      // let image;
      // let defaultValue = desc.defaultValue;
      // if (desc.defaultValue instanceof BaseImage) {
      //     image = desc.defaultValue;
      //     defaultValue = new Color();
      // }
      let param = this.getParameter(desc.name)
      // if(param && param.getType() != desc.defaultValue)
      // removeParameter
      if (!param)
        param = this.addParameter(
          generateParameterInstance(desc.name, desc.defaultValue, desc.range, desc.texturable != false)
        )
      // if(desc.texturable != false) {// By default, parameters are texturable. texturable must be set to false to disable texturing.
      //     if(!param.getImage)
      //         this.__makeParameterTexturable(param);
      //     // if(image)
      //     //     param.setImage(image)
      // }

      paramMap[desc.name] = true
    }

    // Remove redundant Params.
    for (const param of this.__params) {
      if (!paramMap[param.getName()]) {
        this.removeParameter(param.getName())
      }
    }

    this.__shaderName = shaderName
    this.emit('shaderNameChanged', { shaderName })
  }

  /**
   * Remove all textures from Material's parameters.
   */
  removeAllTextures() {
    for (const param of this.__params) {
      if (param.getImage && param.getImage()) {
        // emit a notification so the GLMaterial knows to
        // Remove refs to GLTexture objects.
        param.setImage(undefined)
      }
    }
  }

  // /////////////////////////////
  // Parameters

  /**
   * Returns all texture parameters in current Material.
   *
   * @return {object} - The return value.
   */
  getParamTextures() {
    const textures = {}
    for (const param of this.__params) {
      if (param.getImage && param.getImage()) textures[param.getName()] = param.getImage()
    }
    return textures
  }

  /**
   * The __makeParameterTexturable method.
   * @param {any} param - The param value.
   * @private
   */
  __makeParameterTexturable(param) {
    makeParameterTexturable(param)
  }

  /**
   * Checks if the material is transparent by checking the `Opacity` parameter.
   *
   * @return {boolean} - Returns true if the material is transparent.
   */
  isTransparent() {
    const opacity = this.getParameter('Opacity')
    if (opacity && (opacity.getValue() < 0.99 || opacity.getImage())) return true
    const baseColor = this.getParameter('BaseColor')
    if (baseColor && baseColor.getImage() && baseColor.getImage().format == 'RGBA') return true
    return false
  }

  /**
   * Returns shader's class of current material, if set. Otherwise it returns `undefined`
   *
   * @return {string|undefined} - The return value.
   */
  getShaderClass() {
    return Registry.getBlueprint(this.getShaderName())
  }

  /**
   * Let you modify or set the shader and all the parameters of current material.
   *
   * @param {object} paramValues - The paramValues.
   * @param {string} shaderName - The shader name.
   */
  modifyParams(paramValues, shaderName) {
    if (shaderName) this.setShaderName(shaderName)
    for (const paramName in paramValues) {
      const param = this.getParameter(paramName)
      if (param) {
        if (paramValues[paramName] instanceof Parameter) {
          this.replaceParameter(paramValues[paramName])
        } else {
          param.setValue(paramValues[paramName])
        }
      } else {
        // Material Param not found....
        // this.addParameter(paramName, paramValues[paramName]);
      }
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes the current object as a json object.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    j.shader = this.__shaderName

    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context = {}) {
    if (!j.shader) {
      console.warn('Invalid Material JSON')
      return
    }
    this.setShaderName(j.shader)
    super.fromJSON(j, context)
    // let props = this.__params;
    // for (let key in j) {
    //     let value;
    //     if (j[key] instanceof Object) {
    //         value = new Color();
    //         value.fromJSON(j[key]);
    //     } else {
    //         value = j[key];
    //     }
    //     this.addParameter(paramName, value);
    // }
  }

  /**
   * Sets state of current Item(Including Shaders and Materials) using a binary reader object.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    let shaderName = reader.loadStr()

    if (shaderName == 'StandardMaterial') {
      shaderName = 'StandardSurfaceShader'
    }
    if (shaderName == 'TransparentMaterial') {
      shaderName = 'TransparentSurfaceShader'
    }
    this.setShaderName(shaderName)

    // if (context.version < 3) {
    if (context.versions['zea-engine'].compare([0, 0, 3]) < 0) {
      this.setName(reader.loadStr())

      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }

      const numParams = reader.loadUInt32()
      for (let i = 0; i < numParams; i++) {
        const paramName = capitalizeFirstLetter(reader.loadStr())
        const paramType = reader.loadStr()
        let value
        if (paramType == 'MaterialColorParam') {
          value = reader.loadRGBAFloat32Color()
          // If the value is in linear space, then we should convert it to gamma space.
          // Note: !! this should always be done in preprocessing...
          value.applyGamma(2.2)
        } else {
          value = reader.loadFloat32()
        }
        const textureName = reader.loadStr()

        // console.log(paramName +":" + value);
        let param = this.getParameter(paramName)
        if (param) param.setValue(value)
        else param = this.addParameter(generateParameterInstance(paramName, value))
        if (textureName != '' && param.setImage) {
          // if(!param.setImage)
          //     this.__makeParameterTexturable(param);

          if (context.materialLibrary.hasImage(textureName)) {
            // console.log(paramName +":" + textureName + ":" + context.materialLibrary[textureName].resourcePath);
            param.setImage(context.materialLibrary.getImage(textureName))
          } else {
            console.warn('Missing Texture:' + textureName)
          }
        }
      }
    } else {
      super.readBinary(reader, context)
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new material, copies its values
   * from this material and returns it.
   *
   * @return {Material} - Returns a new cloned material.
   */
  clone() {
    const cloned = new Material()
    cloned.copyFrom(this)
    return cloned
  }

  /**
   * When a Material is copied, first runs `BaseItem` copyFrom method, then sets shader.
   *
   * @param {Material} src - The material to copy from.
   */
  copyFrom(src) {
    super.copyFrom(src)
    this.setShaderName(src.getShaderName())
    for (const srcParam of src.getParameters()) {
      const param = src.getParameter(srcParam.getName())
      if (!srcParam.getImage) this.__makeParameterTexturable(param)
    }
  }
}
Registry.register('Material', Material)

export default Material
export { Material }
