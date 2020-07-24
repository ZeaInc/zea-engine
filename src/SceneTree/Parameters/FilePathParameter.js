import { ParamFlags, Parameter } from './Parameter.js'
import { resourceLoader } from '../ResourceLoader.js'

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
  constructor(name, exts) {
    super(name, '', 'FilePath')
    if (exts) this.setSupportedExts(exts)
  }

  /**
   * Sets supported extensions, if this supports more than one type of files, separate them with regex or(|).
   *
   * i.e.: jpg|png|gif
   *
   * @param {string} exts - The exts value.
   */
  setSupportedExts(exts) {
    // Note: supported Extensions should be in the format ext1|exts2|ext3
    this.__reextensions = new RegExp('\\.(' + exts + ')$', 'i')
  }

  /**
   * Returns complete file path.
   *
   * @return {string} - The return value.
   */
  getFilepath() {
    if (this.__file) {
      return resourceLoader.getFilepath(this.__file.id)
    }

    return ''
  }

  /**
   * Resolves resourceId using the specified path and sets its value to the parameter.
   *
   * @param {string} filePath - The filePath value.
   */
  setFilepath(filePath) {
    const resourceId = resourceLoader.resolveFilePathToId(filePath)
    if (!resourceId) {
      console.warn('Resource unavailable:' + filePath)
      return
    }
    this.setValue(resourceId)
  }

  /**
   * Returns parameter's file name
   *
   * @return {string} - The return value.
   */
  getFilename() {
    if (this.__file) {
      return this.__file.name
    }
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
   * Returns parent folder for of current parameter file.
   *
   * @return {object} - The return value.
   */
  getFileFolder() {
    if (this.__file) {
      if (this.__file.parent) return resourceLoader.getFile(this.__file.parent)
      return resourceLoader.getRootFolder()
    }
  }

  /**
   * Returns parent folder for of current parameter file.
   *
   * @return {string} - The return value.
   */
  getFileFolderPath() {
    const filePath = this.getFilepath()
    if (filePath) {
      return filePath.substring(0, filePath.lastIndexOf('/')) + '/'
    }
  }

  /**
   * Returns file object, which contains the url, resourceId and the name.
   *
   * @return {object} - The return value.
   */
  getFile() {
    return this.__file
  }

  /**
   * The getFileDesc method.
   * @return {object} - The return value.
   */
  getFileDesc() {
    console.warn('@todo-review')
    // Can we settle on a convention?
    // console.warn("Deprecated method: 'getFileDesc'. Please use 'getFile'")
    return this.__file
  }

  /**
   * Sets file data.
   *
   * @param {string} url - the url value of the
   * @param {string} name - (optional) the name of the file that the Url points to.
   */
  setUrl(url, name) {
    const parts = url.split('/')
    if (!name) name = parts[parts.length - 1]

    this.__value = name
    this.__file = {
      id: url,
      name,
      url,
    }

    this.__flags |= ParamFlags.USER_EDITED
    this.emit('valueChanged', { mode: ParamFlags.USER_EDITED })
  }

  /**
   * Returns the file url string.
   *
   * @return {string} - The return value.
   */
  getUrl() {
    return this.__file ? this.__file.url : undefined
  }

  /**
   * The setDirty method.
   * @private
   * @param {function} cleanerFn - The cleanerFn value.
   */
  setDirty(cleanerFn) {
    console.warn('@todo-review')
    throw new Error('Cannot drive a filepath param from an operator')
  }

  /**
   * Sets file parameter value receiving its resource id.
   *
   * @param {string} value - The value param.
   * @return {boolean} - The return value.
   */
  setValue(value) {
    // 0 == normal set. 1 = changed via cleaner fn, 2 = change by loading/cloning code.
    if (value == undefined) {
      throw new Error('Invalid value for setValue.')
    }
    if (value.indexOf('.') > 0) {
      console.warn('Deprecation warning for setValue. setValue should now only take a file id, not a path.')
      return this.setFilepath(value)
    }
    // Note: equality tests only work on simple types.
    // Important here because file changes cause reloads..
    if (value == this.__value) {
      return
    }

    // Note: the file path is selected by using the file browser
    // For now it can return an absolute path(within the project)
    // and we convert to relative when we save.
    const resourceId = value
    if (!resourceLoader.resourceAvailable(resourceId)) {
      console.warn('Resource unavailable:' + resourceId)
      return
    }

    const file = resourceLoader.getFile(resourceId)
    if (this.__reextensions && !this.__reextensions.test(file.name)) {
      console.warn('Unsupported file type:' + file.name)
      return false
    }

    this.__value = value
    this.__file = file

    resourceLoader.on('fileUpdated', (event) => {
      if (event.fileId == this.__value) {
        this.__file = resourceLoader.getFile(this.__value)
        this.emit('fileUpdated', event)
      }
    })

    this.__flags |= ParamFlags.USER_EDITED
    this.emit('valueChanged', { mode: ParamFlags.USER_EDITED })
  }
  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return
    const j = {}
    if (this.__file) {
      j.value = this.__file.id
      // For cases where the file ID changed.
      // e.g. if a file was deleted from the system, and
      // then re-added
      j.filepath = resourceLoader.getFilepath(this.__file.id)
    }
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.value) {
      if (j.value.indexOf('.') > 0) {
        this.__value = j.value
      } else {
        if (resourceLoader.resourceAvailable(j.value)) {
          this.__value = j.value
          this.__flags |= ParamFlags.USER_EDITED
        }
      }
    } else if (j.filepath) {
      const resourceId = resourceLoader.resolveFilePathToId(j.filepath)
      if (!resourceId) {
        console.warn('Resource unavailable:' + j.filepath)
      } else {
        this.__value = resourceId
      }
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new file path parameter,
   * copies its values from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {FilePathParameter} - Returns a new cloned file path parameter.
   */
  clone(flags) {
    const clonedParam = new FilePathParameter(this.__name)
    clonedParam.__file = this.__file
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
  }
}

export { FilePathParameter }
