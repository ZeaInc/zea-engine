testingHarness.registerTest('Materials', (domElement, resources)=> {
    
    const scene = new Visualive.Scene(resources);

    // const envMapName = "Assets/hdri_sky_02_sample" + (Visualive.SystemDesc.isMobileDevice ? 2 : 0) + ".vlh";
    const envMap = new Visualive.EnvMap("envMa");
    envMap.getParameter('FilePath').setValue("Assets/HDR_041_Path_Ref.vlenv");
    // const envMap =  new Visualive.FileImage(envMapName);
    scene.setEnvMap(envMap);
    scene.getCamera().setPositionAndTarget(0, new Visualive.Vec3(-20,-20,10), new Visualive.Vec3(10,10,0));

    const addMeshShape = (name, shape, pos, mat)=>{
        const geomItem = new Visualive.GeomItem(name, shape, mat);
        scene.getRoot().addChild(geomItem);
        geomItem.setLocalXfo(0, new Visualive.Xfo(pos));
    }
    for(let i=0; i<10; i++){
        for(let j=0; j<10; j++){
            const material = new Visualive.Material('surfaces', 'StandardSurfaceShader');
            material.getParameter('BaseColor').setValue(new Visualive.Color(0.6, 0.0, 0.0));
            material.getParameter('Roughness').setValue(i/9);
            material.getParameter('Metallic').setValue(j < 5 ? 0.05 : 0.95);
            material.getParameter('Reflectance').setValue(j < 5 ? 0.03 : 0.8);
            addMeshShape('Sphere'+i+"-"+j, new Visualive.Sphere(1.4, 40), new Visualive.Vec3(i*3.4, j*3.4, 0), material);
        }
    }
    
    const renderer = new Visualive.GLVisualiveRenderer(domElement);
    renderer.exposure = 1.0;
    
    renderer.setScene(scene);
    renderer.frameAll();

    renderer.resumeDrawing();

});