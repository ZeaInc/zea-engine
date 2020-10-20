# How to customize the Camera Manipulation
There are multiple camera manipulation modes built in the engine's [CameraManipulator](api/SceneTree/Manipulators/CameraManipulator).
[**Turntable**](#turntable), [**Tumbler**](#tumbler) and [**Trackball**](#trackball) are modes for rotating the models around.


### Turntable
Mostly recommended when the model has an associated real world axis; but the down side of it is that you can't freely rotate the camera.
Left and right rotate around the global `Z` axis and Up and Down rotate around the local `X` axis.

**How to set it up?**
```javascript
 renderer
  .getViewport()
  .getManipulator()
  .setDefaultManipulationMode(CameraManipulator.MANIPULATION_MODES.turntable);
```

<!-- Copy and Paste Me -->
<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/zea-demo-cam-manipulator-turntable?path=index.html&previewSize=100"
    title="zea-demo-cam-manipulator-turntable on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>


### Tumbler
Lets you freely rotate the camera around the axes, contrary to the [**Turntable**](#turntable) mode, but it causes the model `tumble` when moving the mouse in small circles while moving to the desired position, which end up in undesired rotations.

**How to set it up?**
```javascript
 renderer
  .getViewport()
  .getManipulator()
  .setDefaultManipulationMode(CameraManipulator.MANIPULATION_MODES.tumbler);
```

<!-- Copy and Paste Me -->
<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/zea-demo-cam-manipulator-tumbler?path=index.html&previewSize=100"
    title="zea-demo-cam-manipulator-tumbler on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

### Trackball
Projects a `ball` towards onto the model and when the pointer is down, the position in the `ball` is grabbed and used to calculate the rotation, but you can only rotate it a maximum of 180º.

**How to set it up?**
```javascript
 renderer
  .getViewport()
  .getManipulator()
  .setDefaultManipulationMode(CameraManipulator.MANIPULATION_MODES.trackball);
```

<!-- Copy and Paste Me -->
<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/zea-demo-cam-manipulator-trackball?path=index.html&previewSize=100"
    title="zea-demo-cam-manipulator-trackball on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

!> If you want to understand more about this topic, please check [Matt Keeter](https://www.mattkeeter.com/projects/rotation/)'s explanation.