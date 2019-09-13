import { Vec2, Vec3, Color } from '../Math';
import { Signal } from '../Utilities';
import { BaseItem } from './BaseItem.js';
import { BaseImage } from './BaseImage.js';
import { sgFactory } from './SGFactory.js';
import {
  Parameter,
  NumberParameter,
  Vec2Parameter,
  Vec3Parameter,
  ColorParameter,
  MaterialFloatParam,
  MaterialColorParam,
} from './Parameters';

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
    return new Parameter(paramName, defaultValue, 'Boolean');
  } else if (typeof defaultValue == 'string') {
    return new Parameter(paramName, defaultValue, 'String');
  } else if (Number.isNumeric(defaultValue)) {
    if (texturable)
      return new MaterialFloatParam(paramName, defaultValue, range);
    else return new NumberParameter(paramName, defaultValue, range);
  } else if (defaultValue instanceof Vec2) {
    return new Vec2Parameter(paramName, defaultValue);
  } else if (defaultValue instanceof Vec3) {
    return new Vec3Parameter(paramName, defaultValue);
  } else if (defaultValue instanceof Color) {
    if (texturable) return new MaterialColorParam(paramName, defaultValue);
    else return new ColorParameter(paramName, defaultValue);
  } else {
    return new Parameter(paramName, defaultValue);
  }
};

class Material extends BaseItem {
  constructor(name, shaderName) {
    super(name);

    this.shaderNameChanged = new Signal();
    this.visibleInGeomDataBuffer = true;

    if (shaderName) this.setShaderName(shaderName);
  }

  getShaderName() {
    return this.__shaderName;
  }

  setShaderName(shaderName) {
    if (this.__shaderName == shaderName) return;

    const shaderClass = sgFactory.getClass(shaderName);
    if (!shaderClass)
      throw 'Error setting Shader. Shader not found:' + shaderName;

    const paramDescs = shaderClass.getParamDeclarations();
    const paramMap = {};
    for (let desc of paramDescs) {
      // Note: some shaders specify default images. Like the speckle texture
      // on the car paint shader.
      // let image;
      // let defaultValue = desc.defaultValue;
      // if (desc.defaultValue instanceof BaseImage) {
      //     image = desc.defaultValue;
      //     defaultValue = new Color();
      // }
      let param = this.getParameter(desc.name);
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
        );
      // if(desc.texturable != false) {// By default, parameters are texturable. texturable must be set to false to disable texturing.
      //     if(!param.getImage)
      //         this.__makeParameterTexturable(param);
      //     // if(image)
      //     //     param.setImage(image)
      // }

      paramMap[desc.name] = true;
    }

    // Remove redundant Params.
    for (let param of this.__params) {
      if (!paramMap[param.getName()]) {
        this.removeParameter(param.getName());
      }
    }

    this.__shaderName = shaderName;
    this.shaderNameChanged.emit(this.__shaderName);
  }

  destroy() {
    this.removeAllTextures();
    super.destroy();
  }

  removeAllTextures() {
    for (let param of this.__params) {
      if (param.getImage && param.getImage()) {
        param.getImage().removeRef(this);
        param.setImage(undefined);
      }
    }
  }

  clone(flags) {
    const cloned = new GeomItem();
    cloned.copyFrom(this, flags);
    return cloned;
  }

  copyFrom(src, flags) {
    super.copyFrom(src, flags);
    this.setShaderName(src.getShaderName());
    for (let srcParam of src.getParameters()) {
      let param = src.getParameter(srcParam.getName());
      if (!srcParam.getImage) this.__makeParameterTexturable(param);
    }
  }

  ///////////////////////////////
  // Parameters

  getParamTextures() {
    const textures = {};
    for (let param of this.__params) {
      if (param.getImage && param.getImage())
        textures[param.getName()] = param.getImage();
    }
    return textures;
  }

  __makeParameterTexturable(param) {
    makeParameterTexturable(param);
    // param.textureConnected.connect(this.textureConnected.emit);
    // param.textureDisconnected.connect(this.textureDisconnected.emit);
  }

  isTransparent() {
    const opacity = this.getParameter('Opacity');
    if (opacity && (opacity.getValue() < 0.99 || opacity.getImage()))
      return true;
    const baseColor = this.getParameter('BaseColor');
    if (
      baseColor &&
      baseColor.getImage() &&
      baseColor.getImage().format == 'RGBA'
    )
      return true;
    return false;
  }

  getShaderClass() {
    return sgFactory.getClass(this.getShaderName());
  }

  modifyParams(paramValues, shaderName) {
    if (shaderName) this.setShaderName(shaderName);
    for (let paramName in paramValues) {
      let param = this.getParameter(paramName);
      if (param) {
        if (paramValues[paramName] instanceof Parameter) {
          this.replaceParameter(paramValues[paramName]);
        } else {
          param.setValue(paramValues[paramName]);
        }
      } else {
        // Material Param not found....
        // this.addParameter(paramName, paramValues[paramName]);
      }
    }
  }

  //////////////////////////////////////////
  // Persistence

  toJSON(context, flags = 0) {
    return super.toJSON(context, flags);
  }

  fromJSON(j, context = {}, flags = 0) {
    if (!j.shader) {
      console.warn('Invalid Material JSON');
      return;
    }
    this.setShaderName(j.shader);
    super.fromJSON(j, context, flags);
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

  readBinary(reader, context) {
    let shaderName = reader.loadStr();

    if (shaderName == 'StandardMaterial') {
      shaderName = 'StandardSurfaceShader';
    }
    if (shaderName == 'TransparentMaterial') {
      shaderName = 'TransparentSurfaceShader';
    }
    this.setShaderName(shaderName);

    if (context.version < 3) {
      this.setName(reader.loadStr());

      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      const numParams = reader.loadUInt32();
      for (let i = 0; i < numParams; i++) {
        const paramName = capitalizeFirstLetter(reader.loadStr());
        const paramType = reader.loadStr();
        let value;
        if (paramType == 'MaterialColorParam') {
          value = reader.loadRGBAFloat32Color();
          // If the value is in linear space, then we should convert it to gamma space.
          // Note: !! this should always be done in preprocessing...
          value.applyGamma(2.2);
        } else {
          value = reader.loadFloat32();
        }
        const textureName = reader.loadStr();

        // console.log(paramName +":" + value);
        let param = this.getParameter(paramName);
        if (param) param.setValue(value);
        else
          param = this.addParameter(
            generateParameterInstance(paramName, value)
          );
        if (textureName != '' && param.setImage) {
          // if(!param.setImage)
          //     this.__makeParameterTexturable(param);

          if (context.materialLibrary.hasImage(textureName)) {
            // console.log(paramName +":" + textureName + ":" + context.materialLibrary[textureName].resourcePath);
            param.setImage(context.materialLibrary.getImage(textureName));
          } else {
            console.warn('Missing Texture:' + textureName);
          }
        }
      }
    } else {
      super.readBinary(reader, context);
    }
  }
}
export { makeParameterTexturable, Material };
// Material;
