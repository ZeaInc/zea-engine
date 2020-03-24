import ZeaEngine from '../../node_modules/@zeainc/zea-engine/dist/zea-engine.esm.js'

testingHarness.registerTest('Geometry/PrimitiveShapes', (domElement, resources)=> {
    const Z = ZeaEngine;

    const scene = new Z.Scene(resources);
    scene.setupGrid(60.0, 6);

    const standardMaterial = new Z.Material('surfaces', 'SimpleSurfaceShader');
    standardMaterial.getParameter('BaseColor').setValue(new Z.Color(89 / 255, 182 / 255, 92 / 255));

    const linesMaterial = new Z.Material('lines', 'LinesShader');
    linesMaterial.getParameter('Color').setValue(new Z.Color(1.0, 0.3, .4));

    // const pointsMaterial = new Z.Material('points', 'FatPointsShader');
    // pointsMaterial.getParameter("PointColor").setValue(new Z.Color(1,0,0));
    // pointsMaterial.getParameter("PointSize").setValue(0.05);
    const pointsMaterial = new Z.Material('points', 'SimpleSurfaceShader');
    pointsMaterial.getParameter('BaseColor').setValue(new Z.Color(1.0, 0.3, .4));

    const addShape = (name, shape, pos, material)=>{
        const geomItem = new Z.GeomItem(name+'Item', shape, material);
        geomItem.setLocalXfo(new Z.Xfo(pos));
        scene.getRoot().addChild(geomItem);
    }

    addShape('Disc', new Z.Disc(2.0, 22), new Z.Vec3(-9, 0, 0), standardMaterial);
    addShape('Plane', new Z.Plane(2.0, 1.5, 22, 22), new Z.Vec3(-6, 0, 0), standardMaterial);
    addShape('Cuboid', new Z.Cuboid(1.5, 2.0, 1.0), new Z.Vec3(-3, 0, 0), standardMaterial);
    addShape('Cone', new Z.Cone(1.2, 4.0), new Z.Vec3(0, 0, 0), standardMaterial);
    addShape('Cylinder', new Z.Cylinder(1.2, 4.0, 32, 2, true), new Z.Vec3(3, 0, 0), standardMaterial);
    addShape('Torus', new Z.Torus(0.4, 1.3), new Z.Vec3(6, 0, 0), standardMaterial);
    addShape('Sphere', new Z.Sphere(1.4, 13), new Z.Vec3(9, 0, 0), standardMaterial);


    addShape('Circle', new Z.Circle(2.2, 12), new Z.Vec3(-6, 6, 0), linesMaterial);
    addShape('Rect', new Z.Rect(1.5, 2.0), new Z.Vec3(-3, 6, 0), linesMaterial);
    addShape('Cross', new Z.Cross(1.5), new Z.Vec3(0, 6, 0), linesMaterial);
    addShape('Grid', new Z.Grid(1.5, 2.0), new Z.Vec3(3, 6, 0), linesMaterial);
    addShape('LinesCuboid', new Z.LinesCuboid(1.5, 2.0, 3.0), new Z.Vec3(6, 6, 0), linesMaterial);

    {
        const width = 200;
        const height = 100;
        const camera = new Z.Camera();

        const aspect = width / height;
        const projectionMatrix = new Z.Mat4();
        camera.updateProjectionMatrix(projectionMatrix, aspect);
        const invProj = projectionMatrix.inverse();
        const frustum = new Z.LinesCuboid(2, 2, 2);
        // console.log(":"+frustum.__vertexAttributes.get('positions'))
        console.log("new Vec3(0.0, 0.0, -1.0):"+invProj.transformVec3(new Z.Vec3(0.0, 0.0, -1.0)))
        console.log("new Vec3(0.0, 0.0,  1.0):"+invProj.transformVec3(new Z.Vec3(0.0, 0.0,  1.0)))

        frustum.setVertex(0, invProj.transformVec3(frustum.getVertex(0)));
        frustum.setVertex(1, invProj.transformVec3(frustum.getVertex(1)));
        frustum.setVertex(2, invProj.transformVec3(frustum.getVertex(2)));
        frustum.setVertex(3, invProj.transformVec3(frustum.getVertex(3)));

        frustum.setVertex(4, invProj.transformVec3(frustum.getVertex(4)));
        frustum.setVertex(5, invProj.transformVec3(frustum.getVertex(5)));
        frustum.setVertex(6, invProj.transformVec3(frustum.getVertex(6)));
        frustum.setVertex(7, invProj.transformVec3(frustum.getVertex(7)));

        // console.log(":"+frustum.__vertexAttributes.get('positions'))

        addShape('frustum', frustum, new Z.Vec3(0, 0, 0), linesMaterial);
    }

    addShape('PointGrid', new Z.PointGrid(2.2, 1.5, 12, 12), new Z.Vec3(-6, 12, 0), pointsMaterial);


    const renderer = new Z.GLRenderer(domElement);
    renderer.getViewport().getCamera().setPositionAndTarget(new Z.Vec3(15, 2, 15), new Z.Vec3(0, 0, 0));
    renderer.setScene(scene);
    // renderer.frameAll();
    renderer.resumeDrawing();


    renderer.getViewport().mouseDownOnGeom.connect((event)=>{
        const geomItem = event.intersectionData.geomItem;
        console.log(geomItem.getPath())
        if(!event.shiftKey && !event.altKey){
          geomItem.setSelected(!geomItem.getSelected());
        }
    });
    
});