import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { BaseImage } from '../BaseImage.js'
import { resourceLoader } from '../ResourceLoader.js'
import { FilePathParameter } from '../Parameters/FilePathParameter'

/**
 * Class representing a VLH image.
 *
 * **Parameters**
 * * **FilePath(`FilePathParameter`):** Used to specify the path to the file.
 *
 * **Events**
 * * **loaded:** Triggered when image data is loaded.
 * * **updated:** Triggered when image data is updated.
 *
 * @extends BaseImage
 */
class VLHImage extends BaseImage {
  /**
   * Create a VLH image.
   * @param {string} name - The name value.
   * @param {object} params - The params value.
   */
  constructor(name, params = {}) {
    let filepath
    if (name != undefined && name.lastIndexOf('.') != -1) {
      filepath = name
      name = name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('.'))
    }
    super(name, params)

    this.__loaded = false
    this.__exposure = 1.0
    this.__ambientLightFactor = 0.0
    this.__hdrtint = new Color(1, 1, 1, 1)
    this.__stream = 'stream' in params ? params['stream'] : false
    this.type = 'FLOAT'

    const fileParam = this.addParameter(new FilePathParameter('FilePath'))
    fileParam.on('valueChanged', () => {
      this.loaded = false

      if (this.getName() == '') {
        // Generate a name from the file path.
        const stem = fileParam.getStem()
        const decorator = stem.substring(stem.length - 1)
        if (!isNaN(decorator)) {
          // Note: ALL image names have an LOD specifier at the end.
          // remove that off when retrieving the name.
          this.setName(stem.substring(0, stem.length - 1))
        } else {
          this.setName(stem)
        }
      }

      const fileId = fileParam.getValue()
      const file = fileParam.getFile()
      this.__loadVLH(fileId, file)
    })

    if (filepath) {
      this.getParameter('FilePath').setFilepath(filepath)
    }
  }

  /**
   * Returns DOM Element.
   *
   * @return {HTMLElement} - The return value.
   */
  getDOMElement() {
    return this.__domElement
  }

  /**
   * Returns `FilePath` parameter's value.
   *
   * @return {string} - The return value.
   */
  getResourcePath() {
    return this.getParameter('FilePath').getValue()
  }

  /**
   * The __decodeData method.
   * @param {object} entries - The entries value.
   * @private
   */
  __decodeData(entries) {
    const ldr = entries.ldr
    const cdm = entries.cdm

    // ///////////////////////////////
    // Parse the data.
    const blob = new Blob([ldr.buffer])
    const ldrPic = new Image()
    ldrPic.onload = () => {
      this.width = ldrPic.width
      this.height = ldrPic.height
      // console.log(resourcePath + ": [" + this.width + ", " + this.height + "]");
      this.__data = {
        ldr: ldrPic,
        cdm: cdm,
      }
      if (!this.__loaded) {
        this.__loaded = true
        this.emit('loaded', {})
      } else {
        this.emit('updated', {})
      }
    }
    ldrPic.src = URL.createObjectURL(blob)
  }

  /**
   * The __loadVLH method.
   * @param {string} fileId - The fileId value.
   * @param {object} file - The file value.
   * @private
   */
  __loadVLH(fileId, file) {
    this.type = 'FLOAT'

    resourceLoader.loadUrl(fileId, file.url, (entries) => {
      if (!entries.ldr || !entries.cdm) {
        for (const name in entries) {
          if (name.endsWith('.jpg')) {
            entries.ldr = entries[name]
            delete entries[name]
          } else if (name.endsWith('.bin')) {
            entries.cdm = entries[name]
            delete entries[name]
          }
        }
      }
      this.__decodeData(entries)
    })
  }

  /**
   * Returns if the data is a stream or not.
   *
   * @return {boolean} - The return value.
   */
  isStream() {
    return false
  }

  /**
   * Returns the status of the data, whether is loaded or not.
   *
   * @return {boolean} - The return value.
   */
  isLoaded() {
    return this.__loaded
  }

  /**
   * Returns all parameters and class state values.
   *
   * @return {object} - The return value.
   */
  getParams() {
    const params = super.getParams()
    if (this.__loaded) {
      params['data'] = this.__data
      params['exposure'] = this.__exposure
    }
    return params
  }

  /**
   * The setHDRTint method.
   * @private
   * @param {Color} hdrtint - The hdrtint value.
   */
  setHDRTint(hdrtint) {
    this.__hdrtint = hdrtint
  }

  /**
   * The getHDRTint method.
   * @private
   * @return {Color} - The return value.
   */
  getHDRTint() {
    return this.__hdrtint
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   */
  toJSON(context) {}

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context) {}

  /**
   * Sets state of current Image using a binary reader object, and adds it to the resource loader.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    // super.readBinary(reader, context);
    this.setName(reader.loadStr())
    const resourcePath = reader.loadStr()
    if (typeof resourcePath === 'string' && resourcePath != '') {
      if (context.lod >= 0) {
        const suffixSt = resourcePath.lastIndexOf('.')
        if (suffixSt != -1) {
          const lodPath = resourcePath.substring(0, suffixSt) + context.lod + resourcePath.substring(suffixSt)
          if (resourceLoader.resourceAvailable(lodPath)) {
            resourcePath = lodPath
          }
        }
      }
      this.getParameter('FilePath').setValue(resourcePath)
    }
  }
}

Registry.register('VLHImage', VLHImage)

export { VLHImage }
