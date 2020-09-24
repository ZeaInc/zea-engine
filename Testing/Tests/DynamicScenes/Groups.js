testingHarness.registerTest('DynamicScenes/Groups', (domElement, resources) => {
  const Z = ZeaEngine

  const scene = new Z.Scene(resources)
  scene.setupGrid(10.0, 10)

  const asset = new Z.AssetItem('Groups')
  scene.getRoot().addChild(asset)

  const makeMaterial = (name, color) => {
    const material = new Z.Material(name, 'SimpleSurfaceShader')
    material.getParameter('BaseColor').setValue(color)
    return material
  }

  const materials = {
    red: makeMaterial('red', new Z.Color(0.6, 0.0, 0.0)),
    redish: makeMaterial('redish', new Z.Color(1.0, 0.5, 0.5)),
    green: makeMaterial('green', new Z.Color(0.0, 1.0, 0.0)),
    blue: makeMaterial('blue', new Z.Color(0.0, 0.0, 0.7)),
  }
  const categories = ['FooBar', 'Foo', 'Bar']
  const geoms = [new Z.Sphere(0.8, 40), new Z.Cylinder(0.7, 1.2, 34)]

  const addMeshShape = (name, shape, pos, materialName, categoryValue) => {
    const geomItem = new Z.GeomItem(name, shape, materials[materialName])
    geomItem.setLocalXfo(new Z.Xfo(pos))
    geomItem.addParameter(new Z.StringParameter('Category', categoryValue))
    return geomItem
  }

  for (let k = 0; k < 4; k++) {
    const level = new Z.TreeItem('level' + k)
    for (let i = 0; i < 10; i++) {
      const materialName = Object.keys(materials)[i % 4]
      for (let j = 0; j < 10; j++) {
        const categoryName = categories[j % 4]
        const geomItem = addMeshShape(
          'Geom-' + k + '-' + i + '-' + j,
          geoms[(i + j) % geoms.length],
          new Z.Vec3(i * 3.4, j * 3.4, k * 5),
          materialName,
          categoryName
        )
        level.addChild(geomItem)
      }
    }
    asset.addChild(level)
  }

  {
    const group = new Z.Group('Path Items')
    group.setPaths(['level0/Geom-0-5-0', ['level0', 'Geom-0-4-0'], ['level0', 'Geom-0-6-0'], ['level0', 'Geom-0-7-0']])
    asset.addChild(group)
    group.setSelected(true)
  }

  {
    // Level2 green Spheres
    const group = new Z.Group('Level2 green Foo Items')
    const groupQueries = group.getParameter('Queries')
    {
      const query = new Z.QueryParameter('level2 Items')
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.PATH)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.REGEX)
      query.setValue('level2')
      groupQueries.addItem(query)
    }
    {
      const query = new Z.QueryParameter()
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.MATERIAL)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.EXACT)
      query.setValue('green')
      groupQueries.addItem(query)
    }
    {
      const query = new Z.QueryParameter()
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.PROPERTY)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.EXACT)
      query.setPropertyName('Category')
      query.setValue('Foo')
      groupQueries.addItem(query)
    }
    asset.addChild(group)
    group.setSelected(true)
  }

  {
    // Level3 red* or blue Geoms
    const group = new Z.Group('Level3 red* or blue or Foo items')
    const groupQueries = group.getParameter('Queries')
    {
      const query = new Z.QueryParameter('level3 Items')
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.PATH)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.REGEX)
      query.setValue('level3')
      groupQueries.addItem(query)
    }
    {
      const query = new Z.QueryParameter()
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.MATERIAL)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.REGEX)
      query.setLocicalOperator(Z.QueryParameter.QUERY_LOGIC.AND)
      query.setValue('^red|blue')
      groupQueries.addItem(query)
    }
    {
      const query = new Z.QueryParameter()
      query.setQueryType(Z.QueryParameter.QUERY_TYPES.PROPERTY)
      query.setMatchType(Z.QueryParameter.QUERY_MATCH_TYPE.EXACT)
      query.setLocicalOperator(Z.QueryParameter.QUERY_LOGIC.OR)
      query.setPropertyName('Category')
      query.setValue('Foo')
      groupQueries.addItem(query)
    }
    asset.addChild(group)
    group.setSelected(true)
  }

  const renderer = new Z.GLRenderer(domElement)
  renderer.getViewport().getCamera().setPositionAndTarget(new Z.Vec3(-15, -15, 20), new Z.Vec3(10, 10, 0))
  renderer.setScene(scene)
  renderer.frameAll()
  renderer.resumeDrawing()

  renderer.getViewport().addEventListener('pointerDownOnGeom', (event) => {
    const geomItem = event.intersectionData.geomItem
    console.log(geomItem.getPath())
    if (event.ctrlKey) {
      geomItem.setSelected(!geomItem.getSelected())

      if (geomItem.getSelected()) {
        if (currGeom) currGeom.setSelected(false)
        currGeom = geomItem
      } else {
        currGeom = undefined
      }
    }
    // if(currMat){
    // console.log(geomItem.getPath() + " setMaterial:" + currMat.getName())
    //   geomItem.setMaterial(currMat);
    // }
  })
})
