import { Registry } from '../../Registry'
import { Parameter } from './Parameter.js'
import { resourceLoader } from '../resourceLoader.js'

/**
 * Represents a specific type of parameter, that only stores file data values.
 *
 * **Events**
 * * **valueChanged:** Triggered when setting file's URL.
 * * **fileUpdated:** Triggered when parameter's value is updated.
 *
 * @extends Parameter
 */
class FilePathParameter extends Parameter {
  /**
   * Create a file path parameter.
   *
   * @param {string} name - The name of the file path parameter.
   * @param {string} exts - The exts value.
   */
  constructor(name) {
    super(name, '', 'FilePath')
  }

  /**
   * Returns complete file path.
   *
   * @return {string} - The return value.
   */
  getFilepath() {
    if (this.__value) {
      return resourceLoader.getFilepath(this.__value)
    }

    return ''
  }

  /**
   * Resolves resourceId using the specified path and sets its value to the parameter.
   *
   * @param {string} filePath - The filePath value.
   */
  setFilepath(filePath) {
    this.setValue(resourceLoader.resolveFileId(filePath))
  }

  /**
   * Returns parameter's file name
   *
   * @return {string} - The return value.
   */
  getFilename() {
    return resourceLoader.resolveFilename(this.__value)
  }

  /**
   * Returns parameter's file extension
   *
   * @return {string} - The return value.
   */
  getExt() {
    const filename = this.getFilename()
    const suffixSt = filename.lastIndexOf('.')
    if (suffixSt != -1) return filename.substring(suffixSt).toLowerCase()
  }

  /**
   * Returns parameter's file name without extension
   *
   * @return {string} - The return value.
   */
  getStem() {
    const filename = this.getFilename()
    if (filename) {
      const parts = filename.split('.')
      if (parts.length == 2) return parts[0]
      else return filename
    }
  }

  /**
   * Returns file object, which contains the url, resourceId and the name.
   *
   * @return {object} - The return value.
   */
  getFileDesc() {
    return this.getFile()
  }

  /**
   * Returns file object, which contains the url, resourceId and the name.
   *
   * @return {object} - The return value.
   */
  getFile() {
    return { id: this.__value, url: this.getUrl(), name: this.getFilename() }
  }

  /**
   * Sets file data.
   *
   * @param {string} url - the url value of the
   * @param {string} name - (optional) the name of the file that the Url points to.
   */
  setUrl(url, name) {
    this.setValue(resourceLoader.resolveFileId(url))
  }

  /**
   * Returns the file url string.
   *
   * @return {string} - The return value.
   */
  getUrl() {
    return resourceLoader.resolveURL(this.__value)
  }

  /**
   * Sets file parameter value
   *
   * @param {string} value - The value param.
   */
  setValue(value) {
    if (!value) {
      throw new Error('Invalid value for setValue.')
    }

    // Important here because file changes cause reloads.
    // Note: equality tests only work on simple types.
    if (value == this.__value) {
      return
    }

    this.__value = value

    this.emit('valueChanged', {})
  }
  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    return { value: this.__value }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.value) {
      this.__value = j.value
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new file path parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {FilePathParameter} - Returns a new cloned file path parameter.
   */
  clone() {
    const clone = new FilePathParameter(this.__name)
    clone.setValue(this.getValue())
    return clone
  }
}

Registry.register('FilePathParameter', FilePathParameter)

export { FilePathParameter }
