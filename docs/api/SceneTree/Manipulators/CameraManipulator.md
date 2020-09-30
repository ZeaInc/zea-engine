<a name="CameraManipulator"></a>

### CameraManipulator 
Class for defining and interaction model of the camera.

The CameraManipulator supports a variety of manipulation modes, and hotkeys/modifier keys
that allow the user to rapidly switch between modes, such as 'turntable' and 'pan'.
A detailed explanation of various camera manipulation modes can be found
here: https://www.mattkeeter.com/projects/rotation/

**MANIPULATION_MODES**
* **pan:** Translates the camera sideways according the the camera's current orientation. Activated by the right mouse button, or two fingered touches on mobile.
* **dolly:** Translates the camera forwards and backwards according the the camera's current orientation. Activated by holding the ctrl and alt keys while using the left mouse button, or the mouse wheel, or two fingered touches on mobile.
* **focussing:** Focusses the camera on a specific 3d point in the scene. Activated by double clicking, or double tapping on a geometry in the 3d view.
* **look:** Rotates the camera around its own position. Useful for simulating looking by turning ones head inside a scene. Activated by holding the ctrl key and right mouse button.
* **turntable:** Rotates the camera around the current camera target, using the turntable style manipulation described above. Activated by the left mouse button.
* **tumbler:** Rotates the camera around the current camera target, using the tumbler style manipulation described above. Activated by the left mouse button.
* **trackball:** Rotates the camera around the current camera target, using the trackball style manipulation described above. Activated by the left mouse button.

The default manipulation mode, is the mode that is active with only the left mouse button. The default manipulation mode is currently 'turntable'.

To Assign a different default manipulation mode, retrieve the manipulator from the viewport
and set the default mode.
```
const customManipulator = renderer.getViewport().getManipulator()
customManipulator.setDefaultManipulationMode(CameraManipulator.MANIPULATION_MODES.trackball);
```

This class is the default manipulator, and can be replaced with custom manipulators.

```
const customManipulator = new CustomCameraManipulator()
renderer.getViewport().setManipulator(customManipulator);
```


**Parameters**
* **orbitRate([`NumberParameter`](api/SceneTree/Parameters/NumberParameter.md)):** The rate at which mouse or touch interactions are translated camera orientation changes.
* **dollySpeed([`NumberParameter`](api/SceneTree/Parameters/NumberParameter.md)):** The rate at which the mouse button or touch interactions are translated camera dolly movement.
* **mouseWheelDollySpeed([`NumberParameter`](api/SceneTree/Parameters/NumberParameter.md)):** The rate at which the mouse wheel interactions are translated camera dolly movement.

  Note: this value defaults to different values for touch based interfaces to mouse based input.
  For mobile devices, the orbit rate defaults to -0.3, and for mouse based interaction, the value defaults to 1.
  A value of 1 means that the camera will rotate 180 degrees for a mouse interaction that spans from the left border of the viewport to the right border.
  Some applications might require lower, or higher default values

To set different default values for mobile or desktop set a different value based on the SystemDesc.isMobileDevice flag.
```
const customManipulator = renderer.getViewport().getManipulator()
customManipulator.getParameter('orbitRate').setValue(SystemDesc.isMobileDevice ? 0.3 : 1)
```

**Events**
* **movementFinished:** Triggered when a camera movement is finished. E.g. when the user releases the mouse after a dolly, or after the focussing action has completed.


**Extends**: <code>[ParameterOwner](api/SceneTree/ParameterOwner.md)</code>  

* [CameraManipulator ⇐ <code>ParameterOwner</code>](#CameraManipulator)
    * [new CameraManipulator(name)](#new-CameraManipulator)
    * _instance_
        * [setDefaultManipulationMode(manipulationMode)](#setDefaultManipulationMode)
        * [look(event, dragVec)](#look)
        * [turntable(event, dragVec)](#turntable)
        * [tumble(event, dragVec)](#tumble)
        * [trackball(event, dragVec)](#trackball)
        * [pan(event, dragVec)](#pan)
        * [dolly(event, dragVec)](#dolly)
        * [panAndZoom(event, panDelta, dragDist)](#panAndZoom)
        * [onPointerDoublePress(event)](#onPointerDoublePress)
        * [onPointerDown(event)](#onPointerDown)
        * [onPointerMove(event)](#onPointerMove)
        * [_onMouseMove(event)](#_onMouseMove)
        * [onPointerUp(event)](#onPointerUp)
        * [onWheel(event)](#onWheel)
        * [_onTouchStart(event)](#_onTouchStart)
        * [onTouchEnd(event)](#onTouchEnd)
        * [onTouchCancel(event)](#onTouchCancel)
    * _static_
        * [MANIPULATION_MODES](#MANIPULATION_MODES)

<a name="new_CameraManipulator_new"></a>

### new CameraManipulator
Create a camera, mouse and keyboard


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name value. |

<a name="CameraManipulator+setDefaultManipulationMode"></a>

### setDefaultManipulationMode
Sets default manipulation mode.
The value can be on of the keys in #CameraManipulator.MANIPULATION_MODES



| Param | Type | Description |
| --- | --- | --- |
| manipulationMode | <code>string</code> | The manipulation mode value. |

<a name="CameraManipulator+look"></a>

### look
The look method.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+turntable"></a>

### turntable
Rotates viewport camera about the target.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+tumble"></a>

### tumble
Rotates viewport camera about the target.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+trackball"></a>

### trackball
Rotates viewport camera about the target.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+pan"></a>

### pan
Rotates the camera around its own `X`,`Y` axes.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+dolly"></a>

### dolly
The dolly method.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| dragVec | <code>[Vec2](api/Math/Vec2.md)</code> | The drag vector value. |

<a name="CameraManipulator+panAndZoom"></a>

### panAndZoom
Rotates the camera around its own `X`,`Y` axes and applies a zoom.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value. |
| panDelta | <code>[Vec2](api/Math/Vec2.md)</code> | The pan delta value. |
| dragDist | <code>number</code> | The drag distance value. |

<a name="CameraManipulator+onPointerDoublePress"></a>

### onPointerDoublePress
Causes an event to occur when a user double presses a pointer over an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> \| <code>TouchEvent</code> | The pointer event that occurs |

<a name="CameraManipulator+onPointerDown"></a>

### onPointerDown
Causes an event to occur when the user starts to drag an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>PointerEvent</code> | The mouse event that occurs. |

<a name="CameraManipulator+onPointerMove"></a>

### onPointerMove
Causes an event to occur when an element is being dragged.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The mouse event that occurs. |

<a name="CameraManipulator+_onMouseMove"></a>

### cameraManipulator
The event that occurs when the user moves the pointer across a screen.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The event value |

<a name="CameraManipulator+onPointerUp"></a>

### onPointerUp
Causes an event to occur when the user has finished dragging an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The mouse event that occurs. |

<a name="CameraManipulator+onWheel"></a>

### onWheel
Causes an event to occur when the mouse wheel is rolled up or down over an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>WheelEvent</code> | The wheel event that occurs. |

<a name="CameraManipulator+_onTouchStart"></a>

### cameraManipulator
Causes an event to occur when the user touches an element on a touch screen.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>TouchEvent</code> | The touch event that occurs. |

<a name="CameraManipulator+onTouchEnd"></a>

### onTouchEnd
Causes an event to occur when the user removes his/her finger from an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>TouchEvent</code> | The touch event that occurs. |

<a name="CameraManipulator+onTouchCancel"></a>

### onTouchCancel
Causes an event to occur when the touch event gets interrupted.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>TouchEvent</code> | The touch event that occurs. |

<a name="CameraManipulator.MANIPULATION_MODES"></a>

### MANIPULATION
Returns a dictionary of support manipulation modes.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>TouchEvent</code> | The touch event that occurs. |

