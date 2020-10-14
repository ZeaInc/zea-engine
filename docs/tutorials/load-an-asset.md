# Loading Asset Files
In this tutorial we will show how to load a simple Obj asset. For each type of asset, the correct Asset class must be constructed and used to load the file. 

Each type of asset class works in the same way so while this sample is showing loading Obj assets, the same concepts apply to loading other types of assets, or even custom asset types. 

This tutorial builds on concepts covered in the following pages:

 * [Getting Started using Zea Engine](getting-started/get-started-with-engine.md)

# Live Example

<!-- Copy and Paste Me -->
<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/load-an-asset?path=src/main.js&previewSize=100"
    title="load-an-asset on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>
<br>

## Constructing the Asset

```javascript
const objAsset = new ObjAsset('cow')
objAsset.getParameter('FilePath').setUrl('data/cow.obj')
scene.getRoot().addChild(objAsset)
```

Constructing the Asset object that will be responsible for loading the data. The ObjAsset can only load text based .obj files, and is used primarliy in testing and simple examples.

> Obj files quickly grow into large unwieldy files as the number of points and triangles in the data increases. To load bigger files, there are other formats that provide more efficient storage for large meshes.


```javascript
renderer.getViewport().getCamera().setPositionAndTarget(new Vec3(10, 10, 5), new Vec3(0, 0, 3))
```
The asset to be loaded is bigger than can fit on scree, so we need to move the camera back a bit to get a better view.


# Load and test
Now your HTML file should look like this.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Load an Asset</title>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <div id="app"></div>
  </body>
  <script type=module>
import { 
  Vec3,
  EulerAngles,
  Xfo,
  ObjAsset,
  Scene, 
  GLRenderer
} from "https://unpkg.com/@zeainc/zea-engine@1.0.7/dist/index.esm.js"

const domElement = document.getElementById("app");

const scene = new Scene();
scene.setupGrid(10.0, 10);

const objAsset = new ObjAsset('cow')
objAsset.getParameter('FilePath').setUrl('data/cow.obj')
scene.getRoot().addChild(objAsset)

const renderer = new GLRenderer(domElement);
renderer.setScene(scene);
renderer.getViewport().getCamera().setPositionAndTarget(new Vec3(10, 10, 5), new Vec3(0, 0, 3))
  </script>
</html>
```

![load-asset0](../_media/load-asset0.png)

## Positioning and Rotating the Asset

Ad you can see, the asset is lying on its side. This is because the asset was authored in an application that assumed the Up axis, as the Y axis. In the engine, the Z axis is instead the up axis, so to correct the misalignment, we need to rotate the model.

```javascript
const xfo = new Xfo();
xfo.tr.set(0, 0, 3.55)
xfo.ori.setFromEulerAngles(new EulerAngles(90 * (Math.PI / 180), 0, 0))
objAsset.getParameter('GlobalXfo').setValue(xfo)
```

The first step is to rotate the Asset by 90 degrees to get the cow standing on its feet. The Xfo value contains an orientation value which is a Quaternion. (see [Quat](api/Math/Quat.md)). Directly manipulating Quaternions can be tricky, so instead we use a [EulerAngles](api/Math/EulerAngles.md) which is a lot easier to understand. Even our EulerAngles take radians, so we must convert 90 degrees to radians before passing it in.

Then the cow is sunk into the ground so we lift it up a bit.
The value of 3.55 in the Z direction is enough to correct this problem.


![load-asset1](../_media/load-asset1.png)
