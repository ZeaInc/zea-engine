testingHarness.registerTest('Groups/GroupMaterials', (domElement, resources) => {
  const Z = ZeaEngine

  const scene = new Z.Scene(resources)
  scene.setupGrid(60.0, 6)

  const standardMaterial1 = new Z.Material('surfaces', 'SimpleSurfaceShader')
  standardMaterial1.getParameter('BaseColor').setValue(new Z.Color(89 / 255, 182 / 255, 92 / 255))

  const standardMaterial2 = new Z.Material('surfaces', 'SimpleSurfaceShader')
  standardMaterial2.getParameter('BaseColor').setValue(new Z.Color(89 / 255, 89 / 255, 182 / 255))

  const group1 = new Z.Group('surfaces')
  group1.getParameter('Material').setValue(standardMaterial1)
  scene.getRoot().addChild(group1)

  const group2 = new Z.Group('surfaces')
  group2.getParameter('Material').setValue(standardMaterial2)
  scene.getRoot().addChild(group2)

  const addShape = (name, shape, pos, group) => {
    const geomItem = new Z.GeomItem(name + 'Item', shape)
    geomItem.setLocalXfo(new Z.Xfo(pos))
    scene.getRoot().addChild(geomItem)
    group.addItem(geomItem)
  }

  addShape('Disc', new Z.Disc(2.0, 22), new Z.Vec3(-9, 0, 0), group1)
  addShape('Plane', new Z.Plane(2.0, 1.5, 22, 22), new Z.Vec3(-6, 0, 0), group1)
  addShape('Cuboid', new Z.Cuboid(1.5, 2.0, 1.0), new Z.Vec3(-3, 0, 0), group1)
  addShape('Cone', new Z.Cone(1.2, 4.0), new Z.Vec3(0, 0, 0), group2)
  addShape('Cylinder', new Z.Cylinder(1.2, 4.0, 32, 2, true), new Z.Vec3(3, 0, 0), group2)
  addShape('Torus', new Z.Torus(0.4, 1.3), new Z.Vec3(6, 0, 0), group2)
  addShape('Sphere', new Z.Sphere(1.4, 13), new Z.Vec3(9, 0, 0), group2)

  const renderer = new Z.GLRenderer(domElement)
  renderer.getViewport().getCamera().setPositionAndTarget(new Z.Vec3(15, 2, 15), new Z.Vec3(0, 0, 0))
  renderer.setScene(scene)
  renderer.frameAll()
  renderer.resumeDrawing()

  renderer.getViewport().addEventListener('pointerDownOnGeom', (event) => {
    const geomItem = event.intersectionData.geomItem
    console.log(geomItem.getPath())
    if (!event.shiftKey && !event.altKey) {
      geomItem.setSelected(!geomItem.getSelected())
    }
  })
})
