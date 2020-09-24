testingHarness.registerTest('Geometry/HitTesting', (domElement, resources) => {
  const Z = ZeaEngine

  /////////////////////////////////////
  // Scene
  const scene = new Z.Scene(resources)
  const renderer = new Z.GLRenderer(domElement)
  renderer.setScene(scene)
  renderer.resumeDrawing()

  renderer.getViewport().getCamera().setPositionAndTarget(new Z.Vec3(18, 17, 14), new Z.Vec3(0, 0, 1))
  const envMap = new Z.EnvMap()
  envMap
    .getParameter('FilePath')
    .setUrl('https://storage.googleapis.com/zea-playground-assets/zea-engine/HDR_029_Sky_Cloudy_Ref.vlh')
  scene.setEnvMap(envMap)

  /////////////////////////////////////
  // Ground Plane
  const groundMaterial = new Z.Material('ground', 'StandardSurfaceShader')
  groundMaterial.getParameter('BaseColor').setValue(new Z.Color(89 / 255, 182 / 255, 92 / 255))
  groundMaterial.getParameter('Roughness').setValue(1.0)
  groundMaterial.getParameter('Metallic').setValue(0.0)
  const quad = new Z.Plane(20, 20)
  const groundPlaneItem = new Z.GeomItem('groundPlaneItem', quad, groundMaterial)
  scene.getRoot().addChild(groundPlaneItem)

  /////////////////////////////////////
  // Obj Asset
  const asset = new Z.ObjAsset('obj')
  asset.getParameter('ObjFilePath').setUrl('https://storage.googleapis.com/zea-playground-assets/zea-engine/cow.obj')
  asset.getParameter('splitObjects').setValue(false)
  asset.getParameter('splitGroupsIntoObjects').setValue(false)
  asset.getParameter('loadMtlFile').setValue(false)
  asset.getParameter('unitsConversion').setValue(1.0)
  asset.getParameter('defaultShader').setValue('StandardSurfaceShader')
  asset.setLocalXfo(new Z.Xfo(new Z.Vec3(0, 0, 3.55), new Z.Quat({ rotateX: Math.PI * 0.5 })))
  scene.getRoot().addChild(asset)

  /////////////////////////////////////
  // Locators
  const locatorMaterial = new Z.Material('locator', 'SimpleSurfaceShader')
  locatorMaterial.getParameter('BaseColor').setValue(new Z.Color(1, 0, 0))
  const locator = new Z.Cuboid(0.05, 0.05, 0.05)
  let index = 0
  const addLocator = (pos) => {
    const locatorItem = new Z.GeomItem('locatorItem' + index++, locator, locatorMaterial)
    locatorItem.setLocalXfo(new Z.Xfo(pos))
    scene.getRoot().addChild(locatorItem)
  }

  const vp = renderer.getViewport()
  let drawing = false
  vp.addEventListener('pointerDownOnGeom', (event) => {
    if (!event.altKey) {
      const { intersectionData } = event
      if (intersectionData) {
        addLocator(intersectionData.intersectionPos)
        // Prevent the camera manipulator from handing the event.
        event.vleStopPropagation = true
        drawing = true
      }
    }
  })
  vp.addEventListener('pointerMove', (event) => {
    if (drawing) {
      const intersectionData = vp.getGeomDataAtPos(event.pointerPos, event.pointerRay)
      if (intersectionData) {
        addLocator(intersectionData.intersectionPos)
      }
    }
  })
  vp.addEventListener('pointerUp', (event) => {
    if (drawing) {
      drawing = false
    }
  })
})
