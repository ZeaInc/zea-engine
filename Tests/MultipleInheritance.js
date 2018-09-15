testingHarness.registerTest('MultipleInheritance', (domElement, resources)=> {
    
    const scene = new Visualive.Scene(resources);
    scene.getCamera().setPositionAndTarget(0, new Visualive.Vec3(-20,-20,10), new Visualive.Vec3(10,10,0));

    const sphere = new Visualive.Sphere(1.4, 40);
    const cuboid = new Visualive.Cuboid(1.4, 2.2, 3.5);
    const material1 = new Visualive.Material('material1', 'SimpleSurfaceShader');
    material1.getParameter('BaseColor').setValue(new Visualive.Color(0.6, 0.0, 0.0));
    const material2 = new Visualive.Material('material2', 'SimpleSurfaceShader');
    material2.getParameter('BaseColor').setValue(new Visualive.Color(0.2, 0.5, 1.0));

    const cuboidGeomItem = new Visualive.GeomItem('cuboid', cuboid, material2);
    scene.getRoot().addChild(cuboidGeomItem);

    const sphereGeomItem = new Visualive.GeomItem('sphere', sphere, material1);
    cuboidGeomItem.addChild(sphereGeomItem);
    cuboidGeomItem.addChild(sphereGeomItem);
    sphereGeomItem.setLocalXfo(0, new Visualive.Xfo(new Visualive.Vec3(-2, 0, 3)));
    sphereGeomItem.setLocalXfo(1, new Visualive.Xfo(new Visualive.Vec3(5, 0, 0)));
    
    // for(let i=0; i<10; i++){
    //     for(let j=0; j<10; j++){
    //         addMeshShape('Sphere'+i+"-"+j, , new Visualive.Vec3(i*3.4, j*3.4, 0), material);
    //     }
    // }
    
    const renderer = new Visualive.GLVisualiveRenderer(domElement);
    renderer.exposure = 1.0;
    
    renderer.setScene(scene);
    renderer.frameAll();

    renderer.resumeDrawing();

});