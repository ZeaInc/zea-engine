import { Vec2, Vec3, Color } from '../Math/index'
import { Signal } from '../Utilities/index'
import { BaseItem } from './BaseItem.js'
import { sgFactory } from './SGFactory.js'
import {
  Parameter,
  NumberParameter,
  Vec2Parameter,
  Vec3Parameter,
  ColorParameter,
} from './Parameters/index'


// Explicit export of parameters that are not included in the
// moduled defined by the index file in the folder. (see Parameters/index.js)
// These parameters depend on classes that ar ParameterOwners. 
// TOOD: Move to this folder.
import { MaterialFloatParam } from './Parameters/MaterialFloatParam'
import { MaterialColorParam } from './Parameters/MaterialColorParam'

const generateParameterInstance = (
  paramName,
  defaultValue,
  range,
  texturable
) => {
  if (
    typeof defaultValue == 'boolean' ||
    defaultValue === false ||
    defaultValue === true
  ) {
    return new Parameter(paramName, defaultValue, 'Boolean')
  } else if (typeof defaultValue == 'string') {
    return new Parameter(paramName, defaultValue, 'String')
  } else if (Number.isNumeric(defaultValue)) {
    if (texturable)
      return new MaterialFloatParam(paramName, defaultValue, range)
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

/** Class representing a material in a scene tree.
 * @extends BaseItem
 */
class Material extends BaseItem {
  /**
   * Create a material
   * @param {string} name - The name of the material.
   * @param {string} shaderName - The name of the shader.
   */
  constructor(name, shaderName) {
    super(name)

    this.shaderNameChanged = new Signal()
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
   * Setter for the shader name.
   * @param {string} shaderName - The shader name.
   */
  setShaderName(shaderName) {
    if (this.__shaderName == shaderName) return

    const shaderClass = sgFactory.getClass(shaderName)
    if (!shaderClass)
      throw new Error('Error setting Shader. Shader not found:' + shaderName)

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
          generateParameterInstance(
            desc.name,
            desc.defaultValue,
            desc.range,
            desc.texturable != false
          )
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
    this.shaderNameChanged.emit(this.__shaderName)
  }

  /**
   * Remove all textures.
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
   * The getParamTextures method.
   * @return {object} - The return value.
   */
  getParamTextures() {
    const textures = {}
    for (const param of this.__params) {
      if (param.getImage && param.getImage())
        textures[param.getName()] = param.getImage()
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
    // param.textureConnected.connect(this.textureConnected.emit);
    // param.textureDisconnected.connect(this.textureDisconnected.emit);
  }

  /**
   * Checks if the material is transparent.
   * @return {boolean} - Returns true if the material is transparent.
   */
  isTransparent() {
    const opacity = this.getParameter('Opacity')
    if (opacity && (opacity.getValue() < 0.99 || opacity.getImage()))
      return true
    const baseColor = this.getParameter('BaseColor')
    if (
      baseColor &&
      baseColor.getImage() &&
      baseColor.getImage().format == 'RGBA'
    )
      return true
    return false
  }

  /**
   * The getShaderClass method.
   * @return {any} - The return value.
   */
  getShaderClass() {
    return sgFactory.getClass(this.getShaderName())
  }

  /**
   * The modifyParams method.
   * @param {any} paramValues - The paramValues.
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
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags = 0) {
    return super.toJSON(context, flags)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context = {}, flags = 0) {
    if (!j.shader) {
      console.warn('Invalid Material JSON')
      return
    }
    this.setShaderName(j.shader)
    super.fromJSON(j, context, flags)
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
   * The readBinary method.
   * @param {object} reader - The reader value.
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
    if (context.versions['zea-engine'].lessThan([0, 0, 3])) {
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
        else
          param = this.addParameter(generateParameterInstance(paramName, value))
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
   * @param {number} flags - The flags value.
   * @return {Material} - Returns a new cloned material.
   */
  clone(flags) {
    const cloned = new Material()
    cloned.copyFrom(this, flags)
    return cloned
  }

  /**
   * The copyFrom method.
   * @param {Material} src - The material to copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    super.copyFrom(src, flags)
    this.setShaderName(src.getShaderName())
    for (const srcParam of src.getParameters()) {
      const param = src.getParameter(srcParam.getName())
      if (!srcParam.getImage) this.__makeParameterTexturable(param)
    }
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    this.removeAllTextures()
    super.destroy()
  }
}
export { Material }
