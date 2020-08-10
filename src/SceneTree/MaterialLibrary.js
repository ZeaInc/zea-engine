import { SystemDesc } from '../SystemDesc.js'
import { EventEmitter } from '../Utilities/index'
import Registry from '../Registry'
import { Material } from './Material.js'
import { FileImage } from './Images/index'

/** Class representing a material library in a scene tree.
 * @private
 */
class MaterialLibrary extends EventEmitter {
  /**
   * Create a material library.
   * @param {string} name - The name of the material library.
   */
  constructor(name = 'MaterialLibrary') {
    super()
    this.__name = name

    this.lod = 0
    if (SystemDesc.isMobileDevice) this.lod = 1
    this.clear()
  }

  /**
   * The clear method.
   */
  clear() {
    this.__images = {}
    this.__materials = {
      Default: new Material('Default', 'SimpleSurfaceShader'),
    }
  }

  /**
   * The getPath method.
   * @return {any} - The return value.
   */
  getPath() {
    return [this.__name]
  }

  /**
   * The getNumMaterials method.
   * @return {any} - The return value.
   */
  getNumMaterials() {
    return Object.keys(this.__materials).length
  }

  /**
   * The getMaterials method.
   * @return {any} - The return value.
   */
  getMaterials() {
    return Object.values(this.__materials)
  }

  /**
   * The getMaterialNames method.
   * @return {any} - The return value.
   */
  getMaterialNames() {
    const names = []
    for (const name in this.__materials) {
      names.push(name)
    }
    return names
  }

  /**
   * The hasMaterial method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  hasMaterial(name) {
    return name in this.__materials
  }

  /**
   * Add a material.
   * @param {Material} material - The material value.
   */
  addMaterial(material) {
    material.setOwner(this)
    this.__materials[material.getName()] = material
  }

  /**
   * The getMaterial method.
   * @param {string} name - The material name.
   * @param {Boolean} assert - The assert value.
   * @return {any} - The return value.
   */
  getMaterial(name, assert = true) {
    const res = this.__materials[name]
    if (!res && assert) {
      throw new Error('Material:' + name + ' not found in library:' + this.getMaterialNames())
    }
    return res
  }

  /**
   * The hasImage method.
   * @param {string} name - The material name.
   * @return {any} - The return value.
   */
  hasImage(name) {
    return name in this.__images
  }

  /**
   * The addImage method.
   * @param {any} image - The image value.
   */
  addImage(image) {
    image.setOwner(this)
    this.__images[image.getName()] = image
  }

  /**
   * The getImage method.
   * @param {string} name - The material name.
   * @param {boolean} assert - The assert value.
   * @return {any} - The return value.
   */
  getImage(name, assert = true) {
    const res = this.__images[name]
    if (!res && assert) {
      throw new Error('Image:' + name + ' not found in library:' + this.getImageNames())
    }
    return res
  }

  /**
   * The getImageNames method.
   * @return {any} - The return value.
   */
  getImageNames() {
    const names = []
    for (const name in this.__images) {
      names.push(name)
    }
    return names
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The load method.
   * @param {any} filePath - The file path.
   */
  load(filePath) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', filePath, true)
    xhr.ontimeout = () => {
      throw new Error('The request for ' + filePath + ' timed out.')
    }
    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.fromJSON(JSON.parse(xhr.responseText))
        } else {
          console.warn(xhr.statusText)
        }
      }
    }
    xhr.send(null)
  }

  /**
   * The toJSON method encodes the current object as a json object.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context = {}) {
    return {
      numMaterials: this.geoms.length(),
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context = {}) {
    context.lod = this.lod
    for (const name in j.textures) {
      const image = new FileImage(name)
      image.fromJSON(j.textures[name])
      this.__images[name] = texture
    }
    for (const name in j.materials) {
      const material = new Material(name)
      material.fromJSON(j.materials[name])
      this.addMaterial(material)
    }
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context = {}) {
    // if (context.version == undefined) context.version = 0

    this.name = reader.loadStr()

    // Specify the Lod to load the images in this library.
    context.lod = this.lod
    context.materialLibrary = this

    const numTextures = reader.loadUInt32()
    for (let i = 0; i < numTextures; i++) {
      const type = reader.loadStr()
      const texture = Registry.constructClass(type, undefined)
      texture.readBinary(reader, context)
      this.__images[texture.getName()] = texture
    }
    const numMaterials = reader.loadUInt32()
    if (numMaterials > 0) {
      const toc = reader.loadUInt32Array(numMaterials)
      for (let i = 0; i < numMaterials; i++) {
        const material = new Material('')
        reader.seek(toc[i]) // Reset the pointer to the start of the item data.
        material.readBinary(reader, context, this.__images)
        this.addMaterial(material)
      }
    }

    this.emit('loaded', {})
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }
}
export { MaterialLibrary }
