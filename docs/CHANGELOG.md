# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.10.2](https://github.com/ZeaInc/zea-engine/compare/v3.10.1...v3.10.2) (2021-06-28)


### Bug Fixes

* Fix mixing multi-draw and non-multi-draw. ([49002b8](https://github.com/ZeaInc/zea-engine/commit/49002b851e28c46a40eec8972a15876601438fdd))
* Fixed FatPointsShader multi-draw code path. ([9c3debf](https://github.com/ZeaInc/zea-engine/commit/9c3debf25d28db052d4cb1417b8c6abf358d3a21))
* Fixed regression in PointsShader in multi-draw. ([3bb38e7](https://github.com/ZeaInc/zea-engine/commit/3bb38e78a4849a26deee59437e2d493a960a67c1))
* Fixed regression in FatLinesShader in multi-draw. ([a796d3a](https://github.com/ZeaInc/zea-engine/commit/a796d3a04ece5bf8c96320d9f53224e262e82f01))
* Fixed multi-draw code path for Firefox. ([ca88db3](https://github.com/ZeaInc/zea-engine/commit/ca88db3efa15d9561f616520ab64d7eaad6aee44))
* Fixed multi-draw code path for iOS. ([54ab89a](https://github.com/ZeaInc/zea-engine/commit/54ab89aa0be7391548c150d1ad456edc2077ec49))

## [3.10.0](https://github.com/ZeaInc/zea-engine/compare/v3.9.1...v3.10.0) (2021-06-16)


### Features

* Lines picking is now easier and more stable using a new line picking filter ([1471dc8](https://github.com/ZeaInc/zea-engine/commit/1471dc83e0928caa35c07931116fe03a32e3079e))
* proxy geometries loaded from zcad files now expose methods to determine the number of triangles and line segments. ([1437c72](https://github.com/ZeaInc/zea-engine/commit/1437c725eaa110cd9fc9cd66e4ca400db7b026a1))
* when loading assets, a new context class enables specifying the system units, paths to external resources, and other information. ([1b8aa4d](https://github.com/ZeaInc/zea-engine/commit/1b8aa4d599ea1d71e90ffc6770c98d723e931550))
* Implemented Vec2.intersectionOfLines and tests.
* TreeItem now supports a toggle to disable the bounding box calculation for its self and subtree.

### Bug Fixes

* Addressed exception rendering transparent geoms in VR. ([1a2f0bf](https://github.com/ZeaInc/zea-engine/commit/1a2f0bf7a4d54f9b0e5bfc7117823fc6019e92d1))
* Animated geometries are now correctly un-culled when they come back into the frustum. ([#431](https://github.com/ZeaInc/zea-engine/issues/431)) ([1b5806f](https://github.com/ZeaInc/zea-engine/commit/1b5806f7e04df8618caf65bec46b0518c52c05e9))
* calling setSelectable(false) on a GeomItem now configures its visibility in the GeomData buffer. ([1d7fbc4](https://github.com/ZeaInc/zea-engine/commit/1d7fbc4f73cee5736e8ebc1f7e060a18df4c20f1))
* culling frustum is now correctly reset to the regular viewport when exiting a VR session. ([47f4270](https://github.com/ZeaInc/zea-engine/commit/47f42703a39896e1596ce482fbdb336fe757a9bd))
* Lines are now easier to select by making the click zone more consistently fatter. ([09892b5](https://github.com/ZeaInc/zea-engine/commit/09892b5f6e14d18c24bddae7f2e6fe757a08d91d))
* Selection highlight in the engine conflicted with selection highlight in the UX library. Removing the engine implementation. ([b42f9d9](https://github.com/ZeaInc/zea-engine/commit/b42f9d9fb25c5d6558d74cd8e95719a2eb7a7c2f))
* To address a performance disparity on platforms where multi-draw is not supported, we now run an almost identical code path that emulates multi-draw. ([ef1222e](https://github.com/ZeaInc/zea-engine/commit/ef1222e3183e409179cad993c870a7adc3a4c3e3))
* CameraManipulator now modifies the Frustum hight value instead of moving the camera when dollying an orthographic camera.([3ac71e8](https://github.com/ZeaInc/zea-engine/pull/429/commits/3ac71e8deecec6d06ce2ad5dcfc1f564f179ef5f))
* Camera now frames more precisely on the scene geometry bounding boxes.

### [3.9.1](https://github.com/ZeaInc/zea-engine/compare/v3.9.0...v3.9.1) (2021-05-19)


### Bug Fixes

* Disabled drawing silhouettes on iOS as it relied on an extension unsupported on iOS. ([100c0f2](https://github.com/ZeaInc/zea-engine/commit/100c0f236c80e87c311d48e11c16a0d24e220bf5))

## [3.9.0](https://github.com/ZeaInc/zea-engine/compare/v3.8.0...v3.9.0) (2021-05-18)

### Features

* Camera near and far dist modulation can be disabled and configured. ([27c1999](https://github.com/ZeaInc/zea-engine/commit/27c19993e10be2c3bf372f3d52a83ad050cb55d8))
* CameraManipulator now supports two-fingered roll in tumbler or trackball manipulation modes. ([ca61cd1](https://github.com/ZeaInc/zea-engine/commit/ca61cd19bf178cfd835b05ee3bd4c7229ac38c77))
* CameraManipulator aim focus feature now has independent settings for double/single mouse clicks and double/single touch taps. ([b650fe6](https://github.com/ZeaInc/zea-engine/commit/b650fe6353af966ef3d5a68fcbb4bc61dcb24e6d))
* Cone and Sphere primitive constructors now provide options to not generate normals. ([5de65bc](https://github.com/ZeaInc/zea-engine/commit/5de65bc8167cd0b4e8fb5efe93c48f58a83e8e57))
* GeomItems can now be filtered from selectability with a simple boolean value 'visibleInGeomDataBuffer'. ([1a62f78](https://github.com/ZeaInc/zea-engine/commit/1a62f786c543f87ff6ae71f6d80f2f89f6c14e3b))
* Improved highlight rendering quality using Sobel Filter to detect borders. ([fabff57](https://github.com/ZeaInc/zea-engine/commit/fabff579a5c525b4e618a7624b74b8ae53a49529))
* LinesShader now provides controls for line stippling.The Shader allows specifying a stipple pattern for un-occluded lines separately from occluded lines. Used to achieve HiddenLine rendering modes. ([79875b8](https://github.com/ZeaInc/zea-engine/commit/79875b81b94ac7de4bbb868991f10ec0951adf4f))
* Renderer can now display a Silhouette around geometries, as part of the implementation of CAD style rendering modes. ([cf55227](https://github.com/ZeaInc/zea-engine/commit/cf552278e2a02d3cbc5451f6a922fc5c9e798977))
* SimpleSurfaceShader and StandardSurfaceShader compute face normals dynamically if not provided as vertex normals. ([4280b2c](https://github.com/ZeaInc/zea-engine/commit/4280b2c7ed5197ba0f975a751c401dadf54d15e1))
* Solid Angle Culling limit value can now be customized on the renderer. renderer.solidAngleLimit = 0.0 will disable culling based on the solid angle of an item. ([a1068b6](https://github.com/ZeaInc/zea-engine/commit/a1068b6a4bcb633f425e8002ac3d6d2742cf5fec))
* The default Orbit rate has been increased to 0.5 on Mobile devices. ([bcddfc1](https://github.com/ZeaInc/zea-engine/commit/bcddfc10496503f9181f1ec2189ece67780f3d3a))


### Bug Fixes

* Addressed an exception thrown then items were re-attached to different parts of the tree, and then had opacity changes. The renderer was not being correctly cleaned when an item was simply moved in the tree, leaving dangling event listeners. ([074574d](https://github.com/ZeaInc/zea-engine/commit/074574da3f8117aa5f6a4d7986376c6524b4505a))
* Camera view no longer pops as the start of manipulations of orthographic cameras. ([30bc147](https://github.com/ZeaInc/zea-engine/commit/30bc147063879ecca605d1223f90720baf4f772b))
* Items being removed and re-added to the renderer now are correctly updated in the frustum culling system. ([7dc5c90](https://github.com/ZeaInc/zea-engine/commit/7dc5c90fe64fb66a5fc64ec6c06689d7716868d4))
* Procedural geoms now correctly support lazily computing vertex normals and hard edge indices. Previously the geometries would not be updated automatically. ([aefc299](https://github.com/ZeaInc/zea-engine/commit/aefc29961c385dceaf108cf5d8e440556fc25e33))
* Screen space items like selection rectangles no longer get culled by the frustum culling system. ([ef49f56](https://github.com/ZeaInc/zea-engine/commit/ef49f56c4eb33f57167f4ca6458fdcf097638e78))
* The frustum culling system would incorrectly cull items at the sides of the screen if those items had very large bounding spheres. This was due to incorrect math calculating the solid angle of the items. ([b41fe82](https://github.com/ZeaInc/zea-engine/commit/b41fe82f760491de6bc8eabd8dc4c8d71cdc2cc9))
* Tightened view framing algorithm so that the the camera is moved to more closely fit the provided items. ([533444c](https://github.com/ZeaInc/zea-engine/commit/533444cacbeddc7148bb90909be77dbf25f30ab3))

## [3.8.0](https://github.com/ZeaInc/zea-engine/compare/v3.7.0...v3.8.0) (2021-04-29)

### Features

* Add `zeaEngine.packageJson` ([620f7ac](https://github.com/ZeaInc/zea-engine/commit/620f7ac543d6234a454691f79c8a0e8ac9a1f37f))

## [3.7.0](https://github.com/ZeaInc/zea-engine/compare/v3.6.0...v3.7.0) (2021-04-28)


### Features

* GeomItem can now calculate precise bounding boxes for geometries after loading a zcad file. ([fafdfe7](https://github.com/ZeaInc/zea-engine/commit/fafdfe730fc0d2761675570d8ce9cb684e45da0c))


### Bug Fixes

* GeomLibrary now correctly cleans up the culling worker when items are removed from the renderer. ([a5f8181](https://github.com/ZeaInc/zea-engine/commit/a5f8181b06b3e1649108c580c6d3de651a96b6b5))
* Mobile Safari touch ([575a430](https://github.com/ZeaInc/zea-engine/commit/575a43074a95d78bbae1ce53e9b972aabf41eb31))
* Removing transparent items from the renderer no longer causes a crash. ([8cf4b15](https://github.com/ZeaInc/zea-engine/commit/8cf4b159e6e849685619c0a054a48966c0a07590))
* Renderer now updates all instances of instanced geometries where topologies are changing. ([a7b5730](https://github.com/ZeaInc/zea-engine/commit/a7b573084507b96961990e18028fb78ae5bf7d71))

## [3.6.0](https://github.com/ZeaInc/zea-engine/compare/v3.5.2...v3.6.0) (2021-04-23)


### Features

* BaseImage now provides wrapping and filter params to the renderer. ([834949b](https://github.com/ZeaInc/zea-engine/commit/834949bd8e36e2b7cf35ee4b23f00a25313696b4))
* BillboardItem now provides a 'Pivot' parameter to control the center pivot of the billboard. ([6212ad2](https://github.com/ZeaInc/zea-engine/commit/6212ad2c2b941f6418d31e6a413f4ff87488b516))
* Camera now supports perspective and orthographic projections, and is able to interpolate between. ([1709f86](https://github.com/ZeaInc/zea-engine/commit/1709f861c8355b0a3dc841a3fb468b97a38dbc1a))
* CameraManipulator now orbits the user around the point under the cursor. ([c8dd77e](https://github.com/ZeaInc/zea-engine/commit/c8dd77e122a293005b3b3aab13ab780e8cceec56))
* GLRenderer now applies the touch-action: none rule to the canvas to prevent scrolling when interacting on the canvas on mobile devices. ([322b327](https://github.com/ZeaInc/zea-engine/commit/322b3278761cb38734f430a101abac89a4136f0d))
* Mouse wheel zooming now moves towards the point below the mouse, if the mouse pointer is over a geometry. ([4839f6e](https://github.com/ZeaInc/zea-engine/commit/4839f6e03d9e1993cfe71db8978e98c6a6b3a2ce))
* PointsShader now supports drawing GeomData and highlights. ([73455d0](https://github.com/ZeaInc/zea-engine/commit/73455d0cccf2cd20875e8afb774cc11ca45261a2))
* Renderer now calculates Frustum culling to reduce the number of drawn objects. ([859c83b](https://github.com/ZeaInc/zea-engine/commit/859c83ba2ea8c601b2e5fa8d5a309f482d91d652))
* StandardSurfaceShader now supports AmbientOcclusion textures. ([f8a7283](https://github.com/ZeaInc/zea-engine/commit/f8a728362d3c267530fe689c339ffd6e45fc1896))


### Bug Fixes

* An exception thrown when all the items for a geom were removed from a GLGeomItemSet, if there were highlighted items before. ([201952d](https://github.com/ZeaInc/zea-engine/commit/201952dbef09f759167e1f7b81e7e8eb4e0b7a64))
* Assigning a regular value to a Material parameter no longer removes the assigned texture. ([e536595](https://github.com/ZeaInc/zea-engine/commit/e536595306fee0cb646da5add0acae8aacde26a1))
* CameraManipulator would sometimes cause rolling when double tapping, leaving the user camera a bit crooked. ([a195b8f](https://github.com/ZeaInc/zea-engine/commit/a195b8f65fa06ac4073549b0f0535e5cf638d1b4))
* Canvas is now immediately resized to fit its parent container when the WebGL context is created, making renderer setup synchronous ([16f9fd7](https://github.com/ZeaInc/zea-engine/commit/16f9fd72d0f0801cb90cf5d3332ab15a1b59f07e))
* Cleaned up memory leak removing items from the renderer. ([d0e9438](https://github.com/ZeaInc/zea-engine/commit/d0e9438bc9cd4a0904ffa5065d0008acfc9606a5))
* Cutting Plane values on the BaseGeomItem are now initialized to reasonable values. ([08c61e7](https://github.com/ZeaInc/zea-engine/commit/08c61e7222b6a8487e2bda756eb5f3c32f249f90))
* done. ([a8b3c59](https://github.com/ZeaInc/zea-engine/commit/a8b3c5996654b2931f43ba623f745a83c0541d4c))
* In some cases lines would render over surfaces and appear to show through in some cases. ([9db725c](https://github.com/ZeaInc/zea-engine/commit/9db725c8875da096046aab3e97593ff30c72b692))
* indices in the renderer became broken after removing a geometry from the renderer. ([638037c](https://github.com/ZeaInc/zea-engine/commit/638037c9292125d84957190ffa7f8707b8bdd388))
* Items are no longer culled if their size, or matrix is calculated in the GPU. Addresses culling single points geometries and Xfo handles. ([fbd2b4f](https://github.com/ZeaInc/zea-engine/commit/fbd2b4f2db534cfed2945a5ccd15944b1914e36b))
* LinesShader opacity in multi-draw now matches opacity in regular drawing. ([29dcbf8](https://github.com/ZeaInc/zea-engine/commit/29dcbf8d8cd2a222ac242e0d6642e446e2d5c776))
* Removed a redundant caching mechanism in the resource loader that prevented re-loading data at the same URL. ([0f8f3e2](https://github.com/ZeaInc/zea-engine/commit/0f8f3e26814de84baa43ea34ee5d9b13d3e4cb1a))
* SimpleUniformBinding now correctly binds textures to uniform values, so all PBR parameters can now be textured. ([1fc68ae](https://github.com/ZeaInc/zea-engine/commit/1fc68ae312858cd106053be0ce914caaa4abcbf2))
* The Canvas size can now be resized to zero width or height without the renderer throwing exceptions. ([67b7a8c](https://github.com/ZeaInc/zea-engine/commit/67b7a8ce8584bb88b38275c4a9fbfb1815fe98cc))
* The Engine became incompatible with its plugins due to a variable rename. This fix puts back the old name to address this compatibility issue. ([4e7c444](https://github.com/ZeaInc/zea-engine/commit/4e7c444aac31af8edd6e26efc2d572b2da939bc6))
* Visibility changes on transparent items now trigger re-sorting of items. ([9726a28](https://github.com/ZeaInc/zea-engine/commit/9726a289dda60545fc046fbac55b123987d049a3))

### [3.5.2](https://github.com/ZeaInc/zea-engine/compare/v3.5.1...v3.5.2) (2021-03-26)


### Bug Fixes

* A redraw is now correctly triggered after a GeomItem visibility changes. ([1cfe32d](https://github.com/ZeaInc/zea-engine/commit/1cfe32d90c12e0abf843a18f8485bdb038b3267d))
* Adding passes to the renderer would cause subsequent pass indexes to become broken. e.g. Adding a new pass would break the Overlay pass and then Handles would not work. ([e3f8354](https://github.com/ZeaInc/zea-engine/commit/e3f83546dc333b3871e4ef6fbc83810d52c033dd))
* Addressed major performance issue in the GLGeomItemSetMultiDraw as it was registering too many listeners to the GLGeomLibrary. ([329fa6d](https://github.com/ZeaInc/zea-engine/commit/329fa6d991df72f0e70e2948b5c232a5f4729fd0))
* GeomIds can now be correctly visualized again by passing { debugGeomIds: true } to the renderer constructor ([8fe65ef](https://github.com/ZeaInc/zea-engine/commit/8fe65ef9dc245e6f5b0f5980ecbd20a1aaa1543f))
* MouseWheel zooming is more smooth now and merges multiple events into a single motion. ([5e862ca](https://github.com/ZeaInc/zea-engine/commit/5e862cad301b5ec7a4a2d0335cbb9df993a6cac0))
* The ZEA Splash image is now removed. ([5b4f82f](https://github.com/ZeaInc/zea-engine/commit/5b4f82f68fd72a9db109295ec30e813095147f79))


### [3.5.1](https://github.com/ZeaInc/zea-engine/compare/v3.5.0...v3.5.1) (2021-03-23)


### Bug Fixes

* Correctly disable PBR on WebGL1. Only affects Safari browsers. ([c31af3d](https://github.com/ZeaInc/zea-engine/commit/c31af3d516fee805bbf98affb66bb771a2f51436))

## [3.5.0](https://github.com/ZeaInc/zea-engine/compare/v3.4.0...v3.5.0) (2021-03-22)


### Features

* The Renderer now request a high-peformance WebGL context by default. ([154d524](https://github.com/ZeaInc/zea-engine/commit/154d5245a43d16b51a2adf700161ce8cb70b298b))


### Bug Fixes

* Alpha in macOS ([3f2f383](https://github.com/ZeaInc/zea-engine/commit/3f2f3838fbe861d8c4ca36bae90d42893e076764))

## [3.4.0](https://github.com/ZeaInc/zea-engine/compare/v3.3.2...v3.4.0) (2021-03-21)


### Features

* GLPass classes can now pack and extract extra data in the GoemData shader and return data in pointer events. ([930f88a](https://github.com/ZeaInc/zea-engine/commit/930f88a59eabcb5e113d6f24e13c851fc26dc8da))


### Bug Fixes

* Async class is no longer used, and now removed from the engine. ([dd5892c](https://github.com/ZeaInc/zea-engine/commit/dd5892c4a44921a34374245af02b33f0f06fda8e))
* Canvas resizing ([b923fb0](https://github.com/ZeaInc/zea-engine/commit/b923fb02644e4efea0ff799c84241917053bad54))

### [3.3.2](https://github.com/ZeaInc/zea-engine/compare/v3.3.1...v3.3.0) (2021-03-16)

### Bug Fixes

* An exception was thrown in the Renderer if an empty geometry was added. Clearing a geometry would leave fragmented empty allocations in the GPU buffers. ([9f5c05d](https://github.com/ZeaInc/zea-engine/commit/9f5c05d012f88db3bf3e079a91932d6b9d82d12c))

## [3.3.0](https://github.com/ZeaInc/zea-engine/compare/v3.2.1...v3.3.0) (2021-03-09)


### Features

* The PBR Lighting pipeline was completely overhauled. The BRDF and HDR image convolution rewritten, and now the Materials match closely those of other PBR renderers such as Unity, Marmoset, and Filament.
* emission now enables causing an object to become completely transparent by lerping off the specular effect. ([34ee061](https://github.com/ZeaInc/zea-engine/commit/34ee06108f87959f6aaed01162250c8b3b3841c9))
* EnvMap convolution quality is now modulated by the detected performance of the GPU. ([8023088](https://github.com/ZeaInc/zea-engine/commit/80230887bdd9586f660c2e034bb079996b54907e))
* Normal Mapping now works well with the new PBR lighting pipeline. ([a7b1f2e](https://github.com/ZeaInc/zea-engine/commit/a7b1f2eb70556dcbc0c5debfbfb0a5a72e70cdf0))
* Transparent objects now use multi-draw ([d49148d](https://github.com/ZeaInc/zea-engine/commit/d49148df215876bb52ee45e847395b53954f5a1c))
* GLShader now generates far nicer formatted error messages. No longer dumping out the entire GLSL code for the shader, instead just the culprit line and a few surrounding lines. ([5af69e3](https://github.com/ZeaInc/zea-engine/commit/5af69e3606e50c52ec53deab1ee2cf697d38000d))
* added Color.addInPlace function. ([470c701](https://github.com/ZeaInc/zea-engine/commit/470c701e771bcfa7d494b2aa7c24e51ef0717741))
* Assets now support a simpler interface for loading data. Simply: Asset.load(url).then(...) ([2caee89](https://github.com/ZeaInc/zea-engine/commit/2caee8975addd1a07d6143ecac62a0307ba4883c))



### Bug Fixes

* Adding a custom highlight multiple times in a tree now does not cause multiple highlightChanged events ([ea03bfa](https://github.com/ZeaInc/zea-engine/commit/ea03bfae181caeb81fa7b2b08b0fff83ab9bd237))
* Addressed error message:  Two textures of different types use the same sampler location ([ea3d354](https://github.com/ZeaInc/zea-engine/commit/ea3d354f84e06d779714d1e0940ebd64107ab8a9))
* Addressed error on Safari due to navigator.hardwareConcurrency being unavailable. ([ff846f4](https://github.com/ZeaInc/zea-engine/commit/ff846f4d0d4a0cd8ec3af4f39f831cc9f73a27f1))
* Addressed regression in test where fat lines and thin lines are rendered from the same lines geometry. ([f401aba](https://github.com/ZeaInc/zea-engine/commit/f401abab05d206975482d6100715237953c352d4))
* All GPU geometries are now lazily uploaded to the GPU during rendering. Fixes issue where sometimes mesh rendered without the correct geometry data after an update to the Mesh. ([824351f](https://github.com/ZeaInc/zea-engine/commit/824351f33962cf9b3d34297505b21e0ea55b4c71))
* Cleaned up detection of transparency. Should be much faster now. ([ad6b1b0](https://github.com/ZeaInc/zea-engine/commit/ad6b1b03eaa091f0682c480fff6e3659cfe274dc))
* Color.equal deprecated in favor of Color.isEqual. ([385c9e6](https://github.com/ZeaInc/zea-engine/commit/385c9e63c2ba8b5b8887104514c56972450ef7c5))
* Fixed incorrect deprecation of equal method in Vec3. ([c729d2a](https://github.com/ZeaInc/zea-engine/commit/c729d2a92bb087c0e26e16d06974050856108658))
* Fixed minor regression running the engine on Safari devices. ([d3c082b](https://github.com/ZeaInc/zea-engine/commit/d3c082b08239aef9e468b44958ee576b004ae0f0))
* GeomData shader was left bound between multi-draw and regular drawing causing warning to be emitted as the 'multi-draw' vertex attribute bindings were still being used. ([30af594](https://github.com/ZeaInc/zea-engine/commit/30af5943b5eb34dc6ed8ff7cc3fce4568d3fccfd))
* If a material became transparent due to baseColor alpha value change, and then the opacity was changed, it would incorrectly determined as opaque. ([53772c7](https://github.com/ZeaInc/zea-engine/commit/53772c7aa1bb43a70baa10539c2de14fe0bc1cb0))
* Materials loaded from zcad files were not being detected as transparent, even if they had transparent parameters. ([f6c997d](https://github.com/ZeaInc/zea-engine/commit/f6c997d544ae797f3eea37c4c81410802fca1799))
* Normalized mouse wheel movements across browsers. Firefox mouse wheel zooming now works as in Chrome. ([ea443b0](https://github.com/ZeaInc/zea-engine/commit/ea443b0c928b35e6c97ce038482a9020ea5932e6))
* ObjeAsset did not need to create its own Material and Geometry libraries as the base class already does this. ([49fa075](https://github.com/ZeaInc/zea-engine/commit/49fa0750bd6d8b2d690123b966771d641ac65201))
* Procedural Sphere was generating texture coordinates with artifacts. ([999ce15](https://github.com/ZeaInc/zea-engine/commit/999ce155a3e16e7a52f65ff8d2dfd413e61291f5))
* Touch event listeners are now registered as passive listeners, which resolves a nagging warning message in Chrome. ([19e4aa6](https://github.com/ZeaInc/zea-engine/commit/19e4aa6afa815ba2f9cba376aafc54e54bb8e642))

## [3.2.0](https://github.com/ZeaInc/zea-engine/compare/v3.0.1...v3.2.0) (2021-02-08)


### Features

* Added Color#addInPlace ([58a9953](https://github.com/ZeaInc/zea-engine/commit/58a99534e91ff20cefbb68c06173ea43f9a01fa8))
* CameraManipulator#setDefaultManipulationMode generates a useful error message if an invalid value is passed ([2cbde30](https://github.com/ZeaInc/zea-engine/commit/2cbde3026767a01c4660778b2b838288733bda8e))
* Due to a change in behavior in Chrome which caused a pause launching the renderer, xrCompatible is now set to false by default. The GL canvas is converted to an XR canvas when an XR device is detected, so no change in behavior should be noticed. ([e5f1ee0](https://github.com/ZeaInc/zea-engine/commit/e5f1ee00b6b5165b02a7d55e0df8cb5558eb3da2))
* GLShader now generates far nicer formatted error messages. No longer dumping out the entire GLSL code for the shader, instead just the culprit line and a few surrounding lines. ([d8b219b](https://github.com/ZeaInc/zea-engine/commit/d8b219b223833dfed1e3484afa8f637d63a19959))
* As geometries are streamed, the bounding box for the tree is now valid as we pre-load the bounding boxes for the geometries into the tree. ([9017f08](https://github.com/ZeaInc/zea-engine/commit/9017f08141eed2c84c23e87d60fbbf93ac584f43))
* CameraManipulator now calls 'setCapture' to avoid redundant geom data rendering during camera movements. ([6134bdd](https://github.com/ZeaInc/zea-engine/commit/6134bddd8c51f28eb149b7fb67101cda6f49e6e5))
* GridTreeItem is now exported for use outside the engine. ([9a5bfc7](https://github.com/ZeaInc/zea-engine/commit/9a5bfc72e0f25e822fbe21a0b120fe07bfdec41f))
* Draw shaders now support debugging of geom Id to verify how effective instancing has been. ([5b87975](https://github.com/ZeaInc/zea-engine/commit/5b87975b2031a39345d25b7a1baa23bba23b400c))
* Pointer events are now emitted from the VRViewport based on interactions with VR controller ([426a153](https://github.com/ZeaInc/zea-engine/commit/426a153c7c748efec022a0b56649c7b6c2f65e6e))
* Implemented support for spectator mode in VR. ([23fdbec](https://github.com/ZeaInc/zea-engine/commit/23fdbecd1d3a4ace576bdb3eed3d0791c5e68855))
* Implemented a 1D Allocator for managing 2d arrays packed into a single 1D Array. ([b37bcca](https://github.com/ZeaInc/zea-engine/commit/b37bccaf2212b4829c32f3b07c32e5354c123a22))
* Initializing VR Stage below the active viewport position. ([ac6c5f2](https://github.com/ZeaInc/zea-engine/commit/ac6c5f2ab2f56ccc928d37528d6282be5c09f22e))
* Material now tracks state to check if a a texture has been assigned, or if it has become transparent. ([7914eac](https://github.com/ZeaInc/zea-engine/commit/7914eacff2c47ca990a04418da35e9bc48221717))
* Multi-draw pipeline now supports lines and points, and also non-32bit attr values. ([0553692](https://github.com/ZeaInc/zea-engine/commit/055369255d2284e94e8455019cd8b30fb5143780))
* Resizing a GLFbo now causes its bound color texture to be resized. ([29359c3](https://github.com/ZeaInc/zea-engine/commit/29359c3dd4578927f6740d8ed9498671a1b2e6a0))
* Resource loader now supports loading binary files via a new plugin ([#309](https://github.com/ZeaInc/zea-engine/issues/309)) ([adc5f1c](https://github.com/ZeaInc/zea-engine/commit/adc5f1c1012ff1b9a84b2a49b0cf4f9fd718f015))


### Bug Fixes

* Cloning NumberParameter or MaterialFloatParam now properly clones the range and step values. ([ad4eefd](https://github.com/ZeaInc/zea-engine/commit/ad4eefd0d98ddd00ebd44665ce7910290c5d3a3c))
* Labels are now lazily updated on the next draw, instead of waiting on a timeout. This means we should no longer have frames where labels disappear/reappear. ([740d42c](https://github.com/ZeaInc/zea-engine/commit/740d42c78d25c907ac9add392276b2ad9ad568d6))
* PointGrid was not correctly generating its geometry after changes to procedural geometries in the previous release.([70e7c46](https://github.com/ZeaInc/zea-engine/commit/70e7c460d8f1637cdfc3af4848d72f7ffe2a1672))
* Cleaned up regressions in the VRViewTool for VR navigation([fe3b656](https://github.com/ZeaInc/zea-engine/commit/fe3b656e5af0c84c9afbf02ec7ab5ad98c701b9a))
* CameraManipulator WASD walk keys were left on when the mouse left the viewport. ([5edd614](https://github.com/ZeaInc/zea-engine/commit/5edd6140e69b6e5ca31862d19164419d20dab9ea))
* VLAAsset was not correctly reporting progress when loading streaming geoms. ([9c828c3](https://github.com/ZeaInc/zea-engine/commit/9c828c3ac1d3e43ebaabeec12763fc58811c2c82))
* ObjAsset was not able to correctly load objects made up of groups. ([ef1d92b](https://github.com/ZeaInc/zea-engine/commit/ef1d92b50062538af67d1b86207ff38ff43b8e1f))
* Viewports can now be initialized after the scene is already assigned to the renderer. Needed for XRViewports. ([a6fbb5c](https://github.com/ZeaInc/zea-engine/commit/a6fbb5cdd09d0397af120e94acd7ce5ffd8772a4))


### [3.0.1] (2020-12-04)


### Bug Fixes

* Fixed property detection on GLLines ([dc2d474](https://github.com/ZeaInc/zea-engine/commit/dc2d474c76f1e77c69204ae8bd2a5aa8ba3af1d4))

## [2.0.0] (2020-09-12)


### ⚠ BREAKING CHANGES

* **npm:** Raw imports are no longer supported.

### Features

* Added 'Overlay' option to LinesShader so lines can be rendered overlaid on scene geometries.
* Added support to make Points and Lines drawn as Overlay.
* SystemDesc now correctly detects RTX based GPUs.


### Bug Fixes

* Docs search now have their own namespace.
* Dynamic updates to lines topology now is reflected in the renderer.
* GeomProxy was missing a method to retrieve the bounding box, which caused regression when loading polygon meshes from zcad files.
* Updated Version class, deprecating old methods.
* Wasm file resolving from script tag.


### Build

* **npm:** Add UMD support.


## 1.3.0 (2020-08-20)


### Features

* Added PointSize parameter to PointsShader now that it's working in Chrome.
* Implemented new 'tumbler' manipulation mode on CameraMouseAndKeyboard manipulator to emulate the behavior of various CAD packages.
* TreeItem.resolvePath now throws an exception if the path cannot be resolved.


### Bug Fixes

* Regressions in the code for procedural lines and material parameter.
* Bug causing circle to throw exception when generating.
* Bug that prevented updating points geometry dynamically.
* Issues related to loading label packs in the labelManager.
* Regression in Group when using the 'manual' Initial Xfo mode.
* Regression in ObjLoader caused by changes to Mesh topology.
* Regressions in RouterOperator due to changes to OperatorOutputs map on Operator.
* Reverted Torus to simpler detail setting. Consistent with Sphere Cone, and Circle.
* Updated all snapshots with new output format.


## 1.2.0 (2020-08-14)


### Features

* Add footer for docs.
* Add GridTreeItem file and update Scene class.
* Added 'mouseOverGeom' and 'mouseLeaveGeom' events.
* Added basic cycle checking in the operator evaluation.
* Add isEqual and approxEqual to Xfo.
* Added splash screen to Zea Engine when loading.
* Implement 'addFace' on Mesh class to make it easier to setup meshes.
* Improved parameter dirtying when many multi-output operators are bound to many different parameters.
* Make the splash screen optional.
* No longer logging the SystemDesc on startup.
* Shaders can now provide a name to the constructor.


### Bug Fixes

* Cleaned up error messages being provided when throwing exceptions.
* Cleaned up dirty state vs clean state on Parameter.
* Duplicated createFromBuffer method on Color class.
* Wrong byteOffset on few classes.
* Debug script for Windows systems.
* Minor issue with the drawCount in the class GLMaterialGeomItemSets.
* Regression causing changes to materials to not trigger re-rendering.
* Regression in Potree due to GLGeom was no longer emitting a 'destructing' event.
* Geometry types are now registered with the SGFactory.
* Math type constructors need to be able to take a Float32Array as an argument.
* OperatorOutput now throws an error if trying to call 'getValue' before a param is connected.
* Operators now become dirty when adding Inputs and Outputs.
* Quat.setFrom2Vectors was incorrectly normalizing input vectors. Now assumes unit vectors are provided.
* Removed 'flags' implementation from Items.
* Removed 'flags' implementation on parameters and geometries, we're no longer using it.
* Replaced old sgFactory from GridTreeItem for Registry.
* Restored code that shouldn't be touched(Backwards compatibility).
* Restoring Box3 to default values in case axes are not numeric.
* Regressions in 'removeParameter' and 'replaceParameter'.
* Throwing errors instead of warnings in Registry class.
