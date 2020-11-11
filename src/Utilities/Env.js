// Note: `globalThis` is not supported in some Safari versions.
// See: https://caniuse.com/mdn-javascript_builtins_globalthis

import pkg from '../../package.json'

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined'

const isJsDom = () => isBrowser() && window.navigator.userAgent.includes('jsdom')

const isNodeJs = () => typeof module === 'object' && typeof module.exports === 'object'

const DEFAULT_BASE_URL = 'https://cdn.jsdelivr.net/npm/@zeainc/zea-engine/dist/'
const PACKAGE_NAME = pkg.name

const getBaseUrl = () => {
  if (isBrowser() && !isJsDom()) {
    const currentScriptSrc = document.currentScript.src

    const isFromPackageManager = currentScriptSrc.includes(PACKAGE_NAME)

    console.debug('currentScriptSrc', currentScriptSrc)
    console.debug('isFromPackageManager', isFromPackageManager)

    const scripts = document.getElementsByTagName('script')

    for (let i = 0; i < scripts.length; i += 1) {
      const script = scripts[i]
      if (script.src.includes('zea-engine')) {
        // Note: the Wasm file is a resource that must be loaded with the engine. If we know the URL for the
        // engine library, then we can determine the URL for the Wasm file.
        // This code generates a URL for the Wasm file based on the position of 'zea-engine' in the path.
        // e.g.
        // https://cdn.jsdelivr.net/combine/npm/@zeainc/zea-engine@umd
        // or
        // https://unpkg.com/@zeainc/zea-engine@1.5.0/dist/index.cjs.js
        // or
        // Trim off all the parts after the engine section, and then append the parts for public resources.
        const parts = script.src.split('/')
        const enginePartIndex = parts.findIndex((part) => part.includes('zea-engine'))
        while (parts.length > enginePartIndex + 1) parts.pop()

        // Now unpack combined urls to get just the engine part.
        // e.g.
        // cdn.jsdelivr.net/combine/npm/@zeainc/zea-engine@umd,npm/@zeainc/zea-ux@umd,npm/@zeainc/zea-kinematics@umd"
        if (parts[parts.length - 1].includes(',')) {
          parts[parts.length - 1] = parts[parts.length - 1].split(',')[0]
        }

        return parts.join('/')
      }
    }

    return currentScriptSrc.substring(0, currentScriptSrc.lastIndexOf('/') + 1)

    // TODO
    // move to pub to dist
  } else {
    // TODO
    // If loading in Node.js...
  }

  return DEFAULT_BASE_URL
}

const Env = {
  baseUrl: getBaseUrl(),
  isBrowser: isBrowser(),
  isJsDom: isJsDom(),
  isNodeJs: isNodeJs(),
}

export { Env }
