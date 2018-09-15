
testingHarness.registerTest('HelloWorld', (domElement, resources) => { 
    const scene = new Visualive.Scene(resources);
    scene.setupGrid(5.0, new Visualive.Color(.53, .53, .53), 50, 0.01);
    scene.getCamera().setPositionAndTarget(0, new Visualive.Vec3(2,2,1.7), new Visualive.Vec3(0,0,0.4));
    
    const renderer = new Visualive.GLVisualiveRenderer(domElement);
    renderer.setScene(scene);
    renderer.resumeDrawing();
});

