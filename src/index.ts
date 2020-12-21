// @ts-expect-error ts-migrate(2732) FIXME: Cannot find module '../package.json'. Consider usi... Remove this comment to see the full error message
import pkg from '../package.json'

import { zeaDebug } from './helpers/zeaDebug.js'
import { LibsRegistry } from './LibsRegistry.js'
import { Env } from './Utilities/index.js'

zeaDebug('Zea Engine version %s', pkg.version)
zeaDebug('Zea Engine env %O', Env)

export * from './SystemDesc.js'
export * from './Registry.js'
export * from './Math/index.js'
export * from './Utilities/index.js'
export * from './SceneTree/index.js'
export * from './Renderer/index.js'

import { SystemDesc } from './SystemDesc.js'
import { Registry } from './Registry.js'
import * as Math from './Math/index.js'
import * as Utilities from './Utilities/index.js'
import * as SceneTree from './SceneTree/index.js'
import * as Renderer from './Renderer/index.js'

export const ZeaEngine = {
  SystemDesc,
  Registry,
  ...Math,
  ...Utilities,
  ...SceneTree,
  ...Renderer,
}

export const libsRegistry = new LibsRegistry(pkg.version)
