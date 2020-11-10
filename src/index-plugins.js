import { ArchiveUnpackerPlugin } from './SceneTree/ResourceLoader/ArchiveUnpackerPlugin.js'
// export * from './SceneTree/ResourceLoader/JsonLoaderPlugin.js'
// export * from './SceneTree/ResourceLoader/TextLoaderPlugin.js'

const archiveUnpackerPlugin = new ArchiveUnpackerPlugin()
window.zeaEngine.resourceLoader.registerPlugin(archiveUnpackerPlugin)
