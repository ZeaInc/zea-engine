testingHarness.registerTest('MultipleInheritance', (domElement, resources) => {

    const scene = new Visualive.Scene(resources);
    scene.getCamera().setPositionAndTarget(0, new Visualive.Vec3(-20, -20, 10), new Visualive.Vec3(10, 10, 0));
    // scene.setupGrid(50)

    const smallcuboid = new Visualive.Cuboid(0.4, 0.1, 0.2);
    const cuboid = new Visualive.Cuboid(0.4, 0.2, 3.5);
    const material1 = new Visualive.Material('material1', 'SimpleSurfaceShader');
    material1.getParameter('BaseColor').setValue(new Visualive.Color(0.6, 0.0, 0.0));
    const material2 = new Visualive.Material('material2', 'SimpleSurfaceShader');
    material2.getParameter('BaseColor').setValue(new Visualive.Color(0.2, 0.5, 1.0));

    const cuboidGeomItem = new Visualive.GeomItem('cuboid', cuboid, material2);
    const leafGeomItem = new Visualive.GeomItem('smallcuboid', smallcuboid, material1);

    {
        // cuboidGeomItem.addChild(leafGeomItem);
        // cuboidGeomItem.addChild(leafGeomItem);
        // cuboidGeomItem.addChild(leafGeomItem);
        // leafGeomItem.setLocalXfo(0, new Visualive.Xfo(new Visualive.Vec3(-2, 0, 3)));
        // leafGeomItem.setLocalXfo(1, new Visualive.Xfo(new Visualive.Vec3(3, 0, 2)));
        // leafGeomItem.setLocalXfo(2, new Visualive.Xfo(new Visualive.Vec3(0, 0, 4)));

        // scene.getRoot().addChild(cuboidGeomItem);
        // cuboidGeomItem.setLocalXfo(0, new Visualive.Xfo(new Visualive.Vec3(-4, 0, 0)));

        // scene.getRoot().addChild(cuboidGeomItem);
        // cuboidGeomItem.setLocalXfo(1, new Visualive.Xfo(new Visualive.Vec3(4, 0, 0)));
    }
    {
        // let idx;
        // idx = leafGeomItem.addOwner(cuboidGeomItem); leafGeomItem.setLocalXfo(idx, new Visualive.Xfo(new Visualive.Vec3(-2, 0, 3)));
        // idx = leafGeomItem.addOwner(cuboidGeomItem); leafGeomItem.setLocalXfo(idx, new Visualive.Xfo(new Visualive.Vec3(3, 0, 3)));
        // idx = leafGeomItem.addOwner(cuboidGeomItem); leafGeomItem.setLocalXfo(idx, new Visualive.Xfo(new Visualive.Vec3(0, 0, 4)));

        // idx = cuboidGeomItem.addOwnerIndex(); cuboidGeomItem.setLocalXfo(idx, new Visualive.Xfo(new Visualive.Vec3(-4, 0, 0))); cuboidGeomItem.setOwnerAtIndex(idx, scene.getRoot()); 
        // idx = cuboidGeomItem.addOwnerIndex(); cuboidGeomItem.setLocalXfo(idx, new Visualive.Xfo(new Visualive.Vec3(4, 0, 0))); cuboidGeomItem.setOwnerAtIndex(idx, scene.getRoot()); 
    }

    {
        const gridSize = 4;
        const gridSpread = 0.5;
        for (let i = 0; i < (gridSize * gridSize * gridSize); i++) {
            const idx = leafGeomItem.addOwner(cuboidGeomItem); 
            leafGeomItem.setLocalXfo(idx, 
                new Visualive.Xfo(
                    new Visualive.Vec3(
                            (i % gridSize) * gridSpread, 
                            (Math.floor(i / gridSize) % gridSize) * gridSpread, 
                            Math.floor(i / (gridSize * gridSize)) * gridSpread
                        )
                    )
                );
        }

        const times = []
        const start = performance.now();
        {
            const gridSize = 10;
            const gridSpread = 6;
            for (let i = 0; i < (gridSize * gridSize); i++) {
                const start = performance.now();
                const idx = cuboidGeomItem.addOwnerIndex();
                cuboidGeomItem.setLocalXfo(idx, 
                    new Visualive.Xfo(
                        new Visualive.Vec3((i % gridSize) * gridSpread, Math.floor(i / gridSize) * gridSpread, 0)
                        )
                    );
                cuboidGeomItem.setOwnerAtIndex(idx, scene.getRoot());

                times.push((performance.now()-start))
            }
        }
        console.log("times:", times)
        console.log("total:", (performance.now()-start))
    }

    const renderer = new Visualive.GLVisualiveRenderer(domElement);
    renderer.exposure = 1.0;

    renderer.setScene(scene);
    renderer.frameAll();

    renderer.resumeDrawing();


    scene.getRoot().mouseDown.connect((event, intersectionData)=>{
        console.log("Mouse Down on Root: pathIndex :", intersectionData);
    });
    renderer.getViewport().mouseDownOnGeom.connect((event, geomItem, intersectionData)=>{
        const path = geomItem.getPath(intersectionData.pathIndex)
        console.log("Mouse Down on Geom:", geomItem.getName(), " path :", path);

        const resolvedItem = scene.getRoot().resolvePath(path, 1);
        if(resolvedItem !== geomItem)
            console.warn("getPath/resolvePath not working");
    });
});