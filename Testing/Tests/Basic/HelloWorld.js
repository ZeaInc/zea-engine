import {
  Vec3,
  Scene,
  GLRenderer,
} from '../../node_modules/@zeainc/zea-engine/dist/zea-engine.esm.js'

testingHarness.registerTest('Basic/HelloWorld', (domElement, resources) => {
  const scene = new Scene(resources)
  scene.setupGrid(5.0, 50)

  const renderer = new GLRenderer(domElement)
  renderer.setScene(scene)
  renderer
    .getViewport()
    .getCamera()
    .setPositionAndTarget(new Vec3(2, 2, 1.7), new Vec3(0, 0, 0.4))
  renderer.resumeDrawing()

  document.addEventListener('keypress', (event) => {
    const key = String.fromCharCode(event.keyCode).toLowerCase()
    console.log(key)
    if (key == 'v' && event.shiftKey) {
      const vrvp = renderer.getVRViewport()
      if (vrvp) vrvp.togglePresenting()
    }
  })
})
