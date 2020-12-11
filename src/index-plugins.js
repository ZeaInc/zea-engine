import { ArchiveUnpackerPlugin } from './SceneTree/ResourceLoader/ArchiveUnpackerPlugin.js'
import { JsonLoaderPlugin } from './SceneTree/ResourceLoader/JsonLoaderPlugin.js'
import { TextLoaderPlugin } from './SceneTree/ResourceLoader/TextLoaderPlugin.js'
import { BinaryLoaderPlugin } from './SceneTree/ResourceLoader/BinaryLoaderPlugin.js'

const archiveUnpackerPlugin = new ArchiveUnpackerPlugin()
window.zeaEngine.resourceLoader.registerPlugin(archiveUnpackerPlugin)

const jsonLoaderPlugin = new JsonLoaderPlugin()
window.zeaEngine.resourceLoader.registerPlugin(jsonLoaderPlugin)

const textLoaderPlugin = new TextLoaderPlugin()
window.zeaEngine.resourceLoader.registerPlugin(textLoaderPlugin)

const binaryLoaderPlugin = new BinaryLoaderPlugin()
window.zeaEngine.resourceLoader.registerPlugin(binaryLoaderPlugin)
