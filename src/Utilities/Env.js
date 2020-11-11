// Note: `globalThis` is not supported in some Safari versions.
// See: https://caniuse.com/mdn-javascript_builtins_globalthis

const DIST_DIR_NAME = '/dist/'
const DEFAULT_BASE_URL = `https://cdn.jsdelivr.net/npm/@zeainc/zea-engine${DIST_DIR_NAME}`

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined'

const isJsDom = () => isBrowser() && window.navigator.userAgent.includes('jsdom')

const isNodeJs = () => typeof module === 'object' && typeof module.exports === 'object'

const getBaseUrl = () => {
  if (isBrowser() && !isJsDom()) {
    const currentScriptSrc = document.currentScript.src
    return currentScriptSrc.substring(0, currentScriptSrc.lastIndexOf(DIST_DIR_NAME)) + DIST_DIR_NAME
  } else {
    // TODO
    // If loading in Node.js.
    return DEFAULT_BASE_URL
  }
}

const Env = {
  baseUrl: getBaseUrl(),
  isBrowser: isBrowser(),
  isJsDom: isJsDom(),
  isNodeJs: isNodeJs(),
}

export { Env }
