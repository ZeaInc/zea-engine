<a name="GLBaseRenderer"></a>

### GLBaseRenderer 
Class representing a GL base renderer.


**Extends**: <code>[ParameterOwner](api/SceneTree/ParameterOwner.md)</code>  

* [GLBaseRenderer ⇐ <code>ParameterOwner</code>](#GLBaseRenderer)
    * [new GLBaseRenderer($canvas, options)](#new-GLBaseRenderer)
    * _instance_
        * [gl](#gl)
        * [addShaderPreprocessorDirective(name, value)](#addShaderPreprocessorDirective)
        * [getShaderPreproc() ⇒ <code>object</code>](#getShaderPreproc)
        * [getWidth() ⇒ <code>number</code>](#getWidth)
        * [getHeight() ⇒ <code>number</code>](#getHeight)
        * [addViewport(name) ⇒ <code>GLViewport</code>](#addViewport)
        * [getViewport(index) ⇒ <code>GLViewport</code>](#getViewport)
        * [getViewportAtPos(offsetX, offsetY) ⇒ <code>GLViewport</code>](#getViewportAtPos)
        * [activateViewport(vp)](#activateViewport)
        * [activateViewportAtPos(offsetX, offsetY)](#activateViewportAtPos)
        * [getActiveViewport() ⇒ <code>GLViewport</code>](#getActiveViewport)
        * [suspendDrawing()](#suspendDrawing)
        * [resumeDrawing()](#resumeDrawing)
        * [renderGeomDataFbos()](#renderGeomDataFbos)
        * ~~[.setupGrid(gridSize, gridColor, resolution, lineThickness)](#GLBaseRenderer+setupGrid) ⇒ <code>GridTreeItem</code>~~
        * [getScene() ⇒ <code>Scene</code>](#getScene)
        * [setScene(scene)](#setScene)
        * [addTreeItem(treeItem)](#addTreeItem)
        * [removeTreeItem(treeItem)](#removeTreeItem)
        * [getGL() ⇒ <code>any</code>](#getGL)
        * [resizeFbos(width, height)](#resizeFbos)
        * [getDiv() ⇒ <code>HTMLElement</code>](#getDiv)
        * [setupWebGL($canvas, webglOptions)](#setupWebGL)
        * [bindEventHandlers()](#bindEventHandlers)
        * [getGLCanvas() ⇒ <code>HTMLCanvasElement</code>](#getGLCanvas)
        * [getScreenQuad() ⇒ <code>GLScreenQuad</code>](#getScreenQuad)
        * [onWheel(event)](#onWheel)
        * [frameAll(viewportIndex)](#frameAll)
        * [getOrCreateShader(shaderName) ⇒ <code>GLShader</code>](#getOrCreateShader)
        * [addPass(pass, passtype, updateIndices) ⇒ <code>number</code>](#addPass)
        * [registerPass(itemAddedFn, itemRemovedFn)](#registerPass)
        * [getPass(index) ⇒ <code>any</code>](#getPass)
        * [findPass(constructor) ⇒ <code>any</code>](#findPass)
        * [getGizmoPass() ⇒ <code>any</code>](#getGizmoPass)
        * [supportsVR() ⇒ <code>any</code>](#supportsVR)
        * [getVRViewport() ⇒ <code>VRViewport</code>](#getVRViewport)
        * [getXRViewport() ⇒ <code>Promise</code>](#getXRViewport)
        * [isXRViewportPresenting() ⇒ <code>boolean</code>](#isXRViewportPresenting)
        * [isContinuouslyDrawing() ⇒ <code>boolean</code>](#isContinuouslyDrawing)
        * [startContinuousDrawing()](#startContinuousDrawing)
        * [stopContinuousDrawing()](#stopContinuousDrawing)
        * [toggleContinuousDrawing()](#toggleContinuousDrawing)
        * [drawItemChanged()](#drawItemChanged)
        * [requestRedraw() ⇒ <code>boolean</code>](#requestRedraw)
        * [bindGLBaseRenderer(renderState)](#bindGLBaseRenderer)
        * [drawScene(renderState)](#drawScene)
        * [drawHighlightedGeoms(renderState)](#drawHighlightedGeoms)
        * [drawSceneGeomData(renderState, [mask])](#drawSceneGeomData)
    * _static_
        * [registerPass(cls, passType)](#registerPass)

<a name="new_GLBaseRenderer_new"></a>

### new GLBaseRenderer
Create a GL base renderer.


| Param | Type | Description |
| --- | --- | --- |
| $canvas | <code>HTMLElement</code> \| <code>HTMLCanvasElement</code> | The canvasDiv value. |
| options | <code>object</code> | The options value. |

<a name="GLBaseRenderer+gl"></a>

### gl
Getter for gl.


<a name="GLBaseRenderer+addShaderPreprocessorDirective"></a>

### addShaderPreprocessorDirective
The addShaderPreprocessorDirective method.



| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name value. |
| value | <code>string</code> | The value param. |

<a name="GLBaseRenderer+getShaderPreproc"></a>

### getShaderPreproc
The getShaderPreproc method.


**Returns**: <code>object</code> - - The return value.  
<a name="GLBaseRenderer+getWidth"></a>

### getWidth
Returns HTMLCanvasElement's width


**Returns**: <code>number</code> - - The return value.  
<a name="GLBaseRenderer+getHeight"></a>

### getHeight
Returns HTMLCanvasElement's Height


**Returns**: <code>number</code> - - The return value.  
<a name="GLBaseRenderer+addViewport"></a>

### addViewport
Adds a new viewport(viewing region) to the scene.


**Returns**: <code>[GLViewport](api/Renderer/GLViewport.md)</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the viewport. |

<a name="GLBaseRenderer+getViewport"></a>

### getViewport
Returns a viewport element by specifying its index in the list of viewports.


**Returns**: <code>[GLViewport](api/Renderer/GLViewport.md)</code> - - The return value.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> | <code>0</code> | The index value. |

<a name="GLBaseRenderer+getViewportAtPos"></a>

### getViewportAtPos
Returns a viewport element under the specified XY coordinates.


**Returns**: <code>[GLViewport](api/Renderer/GLViewport.md)</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| offsetX | <code>number</code> | The viewport offset in the X axis. |
| offsetY | <code>number</code> | The viewport offset in the Y axis. |

<a name="GLBaseRenderer+activateViewport"></a>

### activateViewport
Sets as `active` the specified viewport.



| Param | Type | Description |
| --- | --- | --- |
| vp | <code>[GLViewport](api/Renderer/GLViewport.md)</code> | The viewport. |

<a name="GLBaseRenderer+activateViewportAtPos"></a>

### activateViewportAtPos
Sets as àctive` the viewport under the specified XY coordinates.



| Param | Type | Description |
| --- | --- | --- |
| offsetX | <code>number</code> | The viewport offset in the X axis. |
| offsetY | <code>number</code> | The viewport offset in the Y axis. |

<a name="GLBaseRenderer+getActiveViewport"></a>

### getActiveViewport
Returns current active viewport.


**Returns**: <code>[GLViewport](api/Renderer/GLViewport.md)</code> - - The return value.  
<a name="GLBaseRenderer+suspendDrawing"></a>

### suspendDrawing
The suspendDrawing method.


<a name="GLBaseRenderer+resumeDrawing"></a>

### resumeDrawing
The resumeDrawing method.


<a name="GLBaseRenderer+renderGeomDataFbos"></a>

### renderGeomDataFbos
The renderGeomDataFbos method. Frame buffer (FBO).


<a name="GLBaseRenderer+setupGrid"></a>

### ~~glBaseRenderer.setupGrid(gridSize, gridColor, resolution, lineThickness) ⇒ <code>GridTreeItem</code>~~
***Deprecated***

Sets up and displays the scene grid of a given size and resolution.


**Returns**: <code>[GridTreeItem](api/SceneTree/GridTreeItem.md)</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| gridSize | <code>number</code> | The size of the grid. |
| gridColor | <code>[Color](api/Math/Color.md)</code> | The color of the grid. |
| resolution | <code>number</code> | The resolution of the grid. |
| lineThickness | <code>number</code> | The thickness of the grid lines. |

<a name="GLBaseRenderer+getScene"></a>

### getScene
Returns current scene(Environment where all assets live) object.


**Returns**: <code>[Scene](api/SceneTree/Scene.md)</code> - - The return value.  
<a name="GLBaseRenderer+setScene"></a>

### setScene
Sets scene to the renderer.



| Param | Type | Description |
| --- | --- | --- |
| scene | <code>[Scene](api/SceneTree/Scene.md)</code> | The scene value. |

<a name="GLBaseRenderer+addTreeItem"></a>

### addTreeItem
Adds tree items to the scene.



| Param | Type | Description |
| --- | --- | --- |
| treeItem | <code>[TreeItem](api/SceneTree/TreeItem.md)</code> | The tree item to add. |

<a name="GLBaseRenderer+removeTreeItem"></a>

### removeTreeItem
Remove tree items from the scene.



| Param | Type | Description |
| --- | --- | --- |
| treeItem | <code>[TreeItem](api/SceneTree/TreeItem.md)</code> | The tree item to remove. |

<a name="GLBaseRenderer+getGL"></a>

### getGL
The getGL method.


**Returns**: <code>any</code> - - The return value.  
<a name="GLBaseRenderer+resizeFbos"></a>

### resizeFbos
The resizeFbos method. Frame buffer (FBO).



| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | The width of the frame buffer. |
| height | <code>number</code> | The height of the frame buffer. |

<a name="GLBaseRenderer+getDiv"></a>

### getDiv
Returns host div of the canvas element.


**Returns**: <code>HTMLElement</code> - - The return value.  
<a name="GLBaseRenderer+setupWebGL"></a>

### setupWebGL
Setups the WebGL configuration for the renderer, specifying the canvas element where our



| Param | Type | Description |
| --- | --- | --- |
| $canvas | <code>HTMLCanvasElement</code> \| <code>HTMLElement</code> | The $canvas value. |
| webglOptions | <code>object</code> | The webglOptions value. |

<a name="GLBaseRenderer+bindEventHandlers"></a>

### bindEventHandlers
Binds IO event handlers to the canvas


<a name="GLBaseRenderer+getGLCanvas"></a>

### getGLCanvas
Returns canvas element where our scene lives.


**Returns**: <code>HTMLCanvasElement</code> - - The return value.  
<a name="GLBaseRenderer+getScreenQuad"></a>

### getScreenQuad
The getScreenQuad method.


**Returns**: <code>[GLScreenQuad](api/Renderer/GLScreenQuad.md)</code> - - The return value.  
<a name="GLBaseRenderer+onWheel"></a>

### onWheel
Causes an event to occur when the mouse wheel is rolled up or down over an element.



| Param | Type | Description |
| --- | --- | --- |
| event | <code>WheelEvent</code> | The event that occurs. |

<a name="GLBaseRenderer+frameAll"></a>

### frameAll
The frameAll method.



| Param | Type | Default | Description |
| --- | --- | --- | --- |
| viewportIndex | <code>number</code> | <code>0</code> | The viewportIndex value. |

<a name="GLBaseRenderer+getOrCreateShader"></a>

### getOrCreateShader
The getOrCreateShader method.


**Returns**: <code>[GLShader](api/Renderer/GLShader.md)</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| shaderName | <code>string</code> | The shader name. |

<a name="GLBaseRenderer+addPass"></a>

### addPass
The addPass method.


**Returns**: <code>number</code> - - The return value.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pass | <code>any</code> |  | The pass value. |
| passtype | <code>number</code> | <code>0</code> | The passtype value. |
| updateIndices | <code>boolean</code> | <code>true</code> | The updateIndices value. |

<a name="GLBaseRenderer+registerPass"></a>

### registerPass
The registerPass method.



| Param | Type | Description |
| --- | --- | --- |
| itemAddedFn | <code>function</code> | The itemAddedFn value. |
| itemRemovedFn | <code>function</code> | The itemRemovedFn value. |

<a name="GLBaseRenderer+getPass"></a>

### getPass
The getPass method.


**Returns**: <code>any</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index value. |

<a name="GLBaseRenderer+findPass"></a>

### findPass
The findPass method.


**Returns**: <code>any</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| constructor | <code>any</code> | The constructor value. |

<a name="GLBaseRenderer+getGizmoPass"></a>

### getGizmoPass
The getGizmoPass method.


**Returns**: <code>any</code> - - The return value.  
<a name="GLBaseRenderer+supportsVR"></a>

### supportsVR
The supportsVR method.


**Returns**: <code>any</code> - - The return value.  
<a name="GLBaseRenderer+getVRViewport"></a>

### getVRViewport
The getVRViewport method.


**Returns**: <code>[VRViewport](api/Renderer/VR/VRViewport.md)</code> - - The return value.  
<a name="GLBaseRenderer+getXRViewport"></a>

### getXRViewport
The getXRViewport method.


**Returns**: <code>Promise</code> - - The return value.  
<a name="GLBaseRenderer+isXRViewportPresenting"></a>

### isXRViewportPresenting
The isXRViewportPresenting method.


**Returns**: <code>boolean</code> - - The return value.  
<a name="GLBaseRenderer+isContinuouslyDrawing"></a>

### isContinuouslyDrawing
The isContinuouslyDrawing method.


**Returns**: <code>boolean</code> - - The return value.  
<a name="GLBaseRenderer+startContinuousDrawing"></a>

### startContinuousDrawing
The startContinuousDrawing method.


<a name="GLBaseRenderer+stopContinuousDrawing"></a>

### stopContinuousDrawing
The stopContinuousDrawing method.


<a name="GLBaseRenderer+toggleContinuousDrawing"></a>

### toggleContinuousDrawing
The toggleContinuousDrawing method.


<a name="GLBaseRenderer+drawItemChanged"></a>

### drawItemChanged
The drawItemChanged method.


<a name="GLBaseRenderer+requestRedraw"></a>

### requestRedraw
Request a single redraw, usually in response to a signal/event.


**Returns**: <code>boolean</code> - - The return value.  
<a name="GLBaseRenderer+bindGLBaseRenderer"></a>

### bindGLBaseRenderer
The bindGLBaseRenderer method.



| Param | Type | Description |
| --- | --- | --- |
| renderState | <code>object</code> | The renderState value. |

<a name="GLBaseRenderer+drawScene"></a>

### drawScene
The drawScene method.



| Param | Type | Description |
| --- | --- | --- |
| renderState | <code>object</code> | The renderState value. |

<a name="GLBaseRenderer+drawHighlightedGeoms"></a>

### drawHighlightedGeoms
The drawHighlightedGeoms method.



| Param | Type | Description |
| --- | --- | --- |
| renderState | <code>object</code> | The renderState value. |

<a name="GLBaseRenderer+drawSceneGeomData"></a>

### drawSceneGeomData
The drawSceneGeomData method.



| Param | Type | Default | Description |
| --- | --- | --- | --- |
| renderState | <code>object</code> |  | The renderState value. |
| [mask] | <code>number</code> | <code>255</code> | The mask value |

<a name="GLBaseRenderer.registerPass"></a>

### registerPass
The registerPass method.



| Param | Type | Description |
| --- | --- | --- |
| cls | <code>function</code> | The cls value. |
| passType | <code>PassType</code> | The passtype value. |

