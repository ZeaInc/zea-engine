import { StringFunctions } from '../../Utilities/StringFunctions'

/**
 * Simple object check.
 * @private
 * @param {any} item - The item value.
 * @return {boolean} - The return value.
 */
export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @private
 * @param {any} target - The target value.
 * @param {...object} ...sources - The ...sources value.
 * @return {any} - The return value.
 */
// @ts-expect-error ts-migrate(7023) FIXME: 'mergeDeep' implicitly has return type 'any' becau... Remove this comment to see the full error message
export function mergeDeep(target: any, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {},
          })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, {
          [key]: source[key],
        })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

/**
 * Class in charge of loading file resources, holding a reference to all of them.
 * Manages workers, callbacks, resource tree and entities.
 *
 * @private
 */
class DriveAdapter {
  __resourceRegisterCallbacks: any;
  __resources: any;
  __resourcesTree: any;
  __resourcesTreeEntities: any;
  emit: any;
  resolveFilepath: any;
  /**
   * Create a resource loader.
   */
  constructor(resources: any) {
    this.__resources = {}
    this.__resourcesTreeEntities = {}
    this.__resourcesTree = {
      children: {},
    }
    this.__resourceRegisterCallbacks = {}

    let baseUrl
    if (window.navigator) {
      const scripts = document.getElementsByTagName('script')
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        if (script.src.includes('zea-engine')) {
          const parts = script.src.split('/')
          parts.pop()
          parts.pop()
          baseUrl = parts.join('/')
          break
        }
      }
      if (!baseUrl) {
        baseUrl = 'https://unpkg.com/@zeainc/zea-engine@0.1.3'
      }
      this.addResourceURL('ZeaEngine/Vive.vla', baseUrl + '/public-resources/Vive.vla')
      this.addResourceURL('ZeaEngine/Oculus.vla', baseUrl + '/public-resources/Oculus.vla')
    }

    if (!baseUrl) {
      baseUrl = 'https://unpkg.com/@zeainc/zea-engine@0.1.3'
    }
    this.addResourceURL('ZeaEngine/Vive.vla', baseUrl + '/public-resources/Vive.vla')
    this.addResourceURL('ZeaEngine/Oculus.vla', baseUrl + '/public-resources/Oculus.vla')

    if (resources) {
      this.setResources(resources)
    }
  }

  /**
   * Returns the resources tree object.
   *
   * @return {object} - The return value.
   */
  getRootFolder() {
    return this.__resourcesTree
  }

  /**
   * The registerResourceCallback method.
   * @param {string} filter - The filter value.
   * @param {function} fn - The fn value.
   */
  registerResourceCallback(filter: any, fn: any) {
    this.__resourceRegisterCallbacks[filter] = fn
    // eslint-disable-next-line guard-for-in
    for (const key in this.__resources) {
      const file = this.__resources[key]
      if (file.name.includes(filter)) fn(file)
    }
  }

  /**
   * The __applyCallbacks method.
   * @param {object} resourcesDict - The resourcesDict value.
   * @private
   */
  __applyCallbacks(resourcesDict: any) {
    const applyCallbacks = (resource: any) => {
      for (const filter in this.__resourceRegisterCallbacks) {
        if (resource.name.includes(filter)) this.__resourceRegisterCallbacks[filter](resource)
      }
    }
    for (const key in resourcesDict) {
      const resource = resourcesDict[key]
      if (resource.url) applyCallbacks(resource)
    }
  }

  /**
   * The __buildTree method.
   * @param {object} resources - The resources param.
   * @private
   */
  __buildTree(resources: any) {
    const buildEntity = (resourceId: any) => {
      if (this.__resourcesTreeEntities[resourceId]) return

      const resource = resources[resourceId]
      resource.id = resourceId
      if (resource.type === 'folder' || resource.type === 'dependency') {
        resource.children = {}
      }
      if (resource.parent) {
        if (!this.__resourcesTreeEntities[resource.parent]) {
          buildEntity(resource.parent)
        }
      }
      const parent = resource.parent ? this.__resourcesTreeEntities[resource.parent] : this.__resourcesTree
      // console.log((parent.name ? parent.name + '/' : '') + resource.name)
      parent.children[resource.name] = resource
      this.__resourcesTreeEntities[resourceId] = resource
    }

    // eslint-disable-next-line guard-for-in
    for (const key in resources) {
      buildEntity(key)
    }
  }

  /**
   * The setResources method.
   * @param {object} resources - The resources value.
   */
  setResources(resources: any) {
    this.__resources = Object.assign(this.__resources, resources)
    this.__buildTree(resources)
    this.__applyCallbacks(resources)
  }

  /**
   * The addResourceURL method.
   * @param {string} resourcePath - The resourcePath value.
   * @param {string} url - The url value.
   */
  addResourceURL(resourcePath: any, url: any) {
    const parts = resourcePath.split('/')
    const filename = parts.pop()
    if (!url) {
      let rootURL = window.location.href.split('#')[0]
      rootURL = rootURL.split('?')[0]
      if (rootURL.endsWith('.html') || rootURL.endsWith('.html')) {
        rootURL = rootURL.substring(0, rootURL.lastIndexOf('/')) + '/'
      }
      const base = rootURL
      if (parts[0] == '.') parts.shift()
      else if (parts[0] == '..') {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'item'.
        item = item.substring(3)
        const baseparts = base.split('/')
        baseparts.pop()
        baseparts.pop()
        // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'base' because it is a constant.
        base = baseparts.join('/') + '/'
      }
      url = base + resourcePath
    }
    let parentId
    const tmp = {}
    for (const part of parts) {
      const key = StringFunctions.hashStr(part)
      if (!(key in this.__resources)) {
        this.__resources[key] = {
          name: part,
          type: 'folder',
          parent: parentId,
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        tmp[key] = this.__resources[key]
      }
      parentId = key
    }

    const key = StringFunctions.hashStr(filename)
    const resource = {
      name: filename,
      url,
      parent: parentId,
      id: key,
    }
    this.__resources[key] = resource

    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    tmp[key] = resource

    this.__buildTree(tmp)
    this.__applyCallbacks(tmp)
  }

  /**
   * The updateFile method.
   * @param {object} file - The file value.
   */
  updateFile(file: any) {
    const newFile = !(file.id in this.__resources)
    this.__resources[file.id] = file
    if (newFile) {
      console.log('New file added')
      const resources = {}
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      resources[file.id] = file
      this.__buildTree(resources)
    }
    this.emit('fileUpdated', { fileId: file.id })
  }

  /**
   * Returns complete file path.
   *
   * @param {string} resourceId - The resourceId value.
   * @return {string} - The return value.
   */
  getFilepath(resourceId: any) {
    let curr = this.__resources[resourceId]
    const path = [curr.name]
    while (curr.parent) {
      curr = this.__resources[curr.parent]
      path.splice(0, 0, curr.name)
    }
    return path.join('/')
  }

  /**
   * The resourceAvailable method.
   *
   * @param {string} resourceId - The resourceId value.
   * @return {boolean} - The return value.
   */
  resourceAvailable(resourceId: any) {
    if (resourceId.indexOf('.') > 0) {
      console.warn('Deprecation warning for resourceAvailable. Value should be a file id, not a path.')
      return this.resolveFilepath(resourceId) != undefined
    }
    return resourceId in this.__resources
  }

  /**
   * The getFile method.
   * @param {string} resourceId - The resourceId value.
   * @return {object} - The return value.
   */
  getFile(resourceId: any) {
    return this.__resources[resourceId]
  }

  /**
   * The resolveFilepath method.
   * @param {string} filePath - The filePath value.
   * @return {object} - The return value.
   */
  resolveFileId(value: any) {
    const parts = value.split('/')
    if (parts[0] == '.' || parts[0] == '') parts.shift()
    let curr = this.__resourcesTree
    for (const part of parts) {
      if (part in curr.children) curr = curr.children[part]
      else {
        throw new Error('Unable to resolve key:' + part + ' of path:' + value)
        return null
      }
    }
    return curr.id
  }

  /**
   * The resolveFilename method.
   * @deprecated
   * @param {string} value - The file value.
   * @return {string} - The resolved URL if an adapter is installed, else the original value.
   */
  resolveFilename(value: any) {
    return this.__resources[value].name
  }

  /**
   * The resolveURL method.
   * @deprecated
   * @param {string} value - The file value.
   * @return {string} - The resolved URL if an adapter is installed, else the original value.
   */
  resolveURL(value: any) {
    return this.__resources[value].url
  }

  /**
   * The traverse method.
   * @param {function} callback - The callback value.
   */
  traverse(callback: any) {
    const __c = (fsItem: any) => {
      // eslint-disable-next-line guard-for-in
      for (const childItemName in fsItem.children) {
        __t(fsItem.children[childItemName])
      }
    }
    const __t = (fsItem: any) => {
      if (callback(fsItem) == false) return false
      if (fsItem.children) __c(fsItem)
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    __c(this.__resourcesTree, 0)
  }
}

export { DriveAdapter }
