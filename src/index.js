if (window.ZeaEngine) {
  console.error('ZeaEngine has been included twice in your project.')
}

export { onResize } from './external/onResize.js'
export * from './BrowserDetection.js'
export * from './Math/index'
export * from './Utilities/index'
export * from './SceneTree/index'
export * from './Renderer/index'
export * from './StateMachine/index'
