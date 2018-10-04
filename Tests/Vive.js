

testingHarness.registerTest('Vive', (domElement, resources)=> {

    /////////////////////////////////////
    // Scene
    const scene = new Visualive.Scene(resources);
    scene.setupGrid(1, 50);
    scene.getCamera().setPositionAndTarget(0, new Visualive.Vec3(8, -4, 7), new Visualive.Vec3(0, 0, 0));

    /////////////////////////////////////
    // Renderer
    
    const renderer = new Visualive.GLVisualiveRenderer(domElement);
    renderer.setScene(scene);
    // renderer.addGUI(gui);

    /////////////////////////////////////
    // Obj Asset
    // const viveAssetId = scene.getResourceLoader().resolveFilePathToId("VisualiveEngine/Vive.vla")
    // const viveAsset = scene.loadCommonAssetResource(viveAssetId);

    const viveAsset = new Visualive.VLAAsset("Vive");
    viveAsset.getParameter('DataFilePath').setFilepath("VisualiveEngine/Vive.vla");
    viveAsset.loaded.connect(()=>{
        const materialLibrary = viveAsset.getMaterialLibrary();
        const materialNames = materialLibrary.getMaterialNames();
        for(let name of materialNames) {
            const material = materialLibrary.getMaterial(name, false);
            if(material)
                material.setShaderName('SimpleSurfaceShader');
        }

        
        // viveAsset.traverse((treeItem)=>{
        //     console.log(treeItem.constructor.name, treeItem.getName())
        // })
    });

    const idx = scene.getRoot().addChild(viveAsset);
    const xfo = new Visualive.Xfo(
        new Visualive.Vec3(0, -0.035, 0.01), 
        new Visualive.Quat({ setFromAxisAndAngle: [new Visualive.Vec3(1, 0, 0), Math.PI * 0.5] })
        );;
    viveAsset.setLocalXfo(idx, xfo);



    // viveAsset.loaded.connect((entries) => {
    //     const controllerTree = viveAsset.getChildByName('HTC_Vive_Controller');
    //     controllerTree.setLocalXfo(new Visualive.Xfo(new Visualive.Vec3(0.25, 0,0)));
    // });

    // viveAsset.allPartsLoaded.connect(()=>{
    //     renderer.frameAll();
    // })


    // const controller = new VisualiveUI.UIController(renderer, VisualiveUI.Main, VisualiveUI.VRControllerUI);
    renderer.resumeDrawing();
});