<a name="GeomItem"></a>

### GeomItem 
Class representing a geometry item in a scene tree.

**Parameters**
* **Geometry([`GeometryParameter`](api/SceneTree\Parameters\GeometryParameter.md)):** The geometry to be rendered for this GeomItem
* **Material([`MaterialParameter`](api/SceneTree\Parameters\MaterialParameter.md)):** The Material to use when rendering this GeomItem
* **GeomOffsetXfo([`XfoParameter`](api/SceneTree\Parameters\XfoParameter.md)):** Provides an offset transformation that is applied only to the geometry and not inherited by child items.
* **GeomMat([`Mat4Parameter`](api/SceneTree\Parameters\Mat4Parameter.md)):** Calculated from the GlobalXfo and the GeomOffsetXfo, this matrix is provided to the renderer for rendering.


**Extends**: <code>[BaseGeomItem](api/SceneTree\BaseGeomItem.md)</code>  

* [GeomItem ⇐ <code>BaseGeomItem</code>](#GeomItem)
    * [new GeomItem(name, geometry, material, xfo)](#new-GeomItem)
    * _instance_
        * [getGeometry() ⇒ <code>BaseGeom</code>](#getGeometry)
        * [setGeometry(geom)](#setGeometry)
        * ~~[.getGeom()](#GeomItem+getGeom) ⇒ <code>BaseGeom</code>~~
        * ~~[.setGeom(geom)](#GeomItem+setGeom) ⇒ <code>number</code>~~
        * [getMaterial() ⇒ <code>Material</code>](#getMaterial)
        * [setMaterial(material)](#setMaterial)
        * [getGeomOffsetXfo() ⇒ <code>Xfo</code>](#getGeomOffsetXfo)
        * [setGeomOffsetXfo(xfo)](#setGeomOffsetXfo)
        * [getGeomMat4() ⇒ <code>Mat4</code>](#getGeomMat4)
        * [toJSON(context) ⇒ <code>object</code>](#toJSON)
        * [fromJSON(json, context)](#fromJSON)
        * [readBinary(reader, context)](#readBinary)
        * [toString() ⇒ <code>string</code>](#toString)
        * [clone(context)](#clone)
        * [copyFrom(src, context)](#copyFrom)
    * _static_
        * [setCalculatePreciseBoundingBoxes(value)](#setCalculatePreciseBoundingBoxes)

<a name="new_GeomItem_new"></a>

### new GeomItem
Creates a geometry item.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the geom item. |
| geometry | <code>[BaseGeom](api/SceneTree\Geometry\BaseGeom.md)</code> | The geometry value. |
| material | <code>[Material](api/SceneTree\Material.md)</code> | The material value. |
| xfo | <code>[Xfo](api/Math\Xfo.md)</code> | The initial Xfo of the new GeomItem. |

<a name="GeomItem+getGeometry"></a>

### getGeometry
Returns `Geometry` parameter value.


**Returns**: <code>[BaseGeom](api/SceneTree\Geometry\BaseGeom.md)</code> - - The return value.  
<a name="GeomItem+setGeometry"></a>

### setGeometry
Sets geometry object to `Geometry` parameter.



| Param | Type | Description |
| --- | --- | --- |
| geom | <code>[BaseGeom](api/SceneTree\Geometry\BaseGeom.md)</code> | The geom value. |

<a name="GeomItem+getGeom"></a>

### ~~geomItem.getGeom() ⇒ <code>BaseGeom</code>~~
***Deprecated***

Getter for geometry (getGeom is deprecated. Please use getGeometry).


**Returns**: <code>[BaseGeom](api/SceneTree\Geometry\BaseGeom.md)</code> - - The return value.  
<a name="GeomItem+setGeom"></a>

### ~~geomItem.setGeom(geom) ⇒ <code>number</code>~~
***Deprecated***

Setter for geometry. (setGeom is deprecated. Please use setGeometry).


**Returns**: <code>number</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| geom | <code>[BaseGeom](api/SceneTree\Geometry\BaseGeom.md)</code> | The geom value. |

<a name="GeomItem+getMaterial"></a>

### getMaterial
Returns the specified value of `Material`parameter.


**Returns**: <code>[Material](api/SceneTree\Material.md)</code> - - The return value.  
<a name="GeomItem+setMaterial"></a>

### setMaterial
Sets material object to `Material` parameter.



| Param | Type | Description |
| --- | --- | --- |
| material | <code>[Material](api/SceneTree\Material.md)</code> | The material value. |

<a name="GeomItem+getGeomOffsetXfo"></a>

### getGeomOffsetXfo
Returns the offset `Xfo` object specified in `GeomOffsetXfo` parameter.


**Returns**: <code>[Xfo](api/Math\Xfo.md)</code> - - Returns the geom offset Xfo.  
<a name="GeomItem+setGeomOffsetXfo"></a>

### setGeomOffsetXfo
Sets `Xfo` object to `GeomOffsetXfo` parameter.



| Param | Type | Description |
| --- | --- | --- |
| xfo | <code>[Xfo](api/Math\Xfo.md)</code> | The Xfo value. |

<a name="GeomItem+getGeomMat4"></a>

### getGeomMat4
Returns `Mat4` object value of `GeomMat` parameter.


**Returns**: <code>[Mat4](api/Math\Mat4.md)</code> - - Returns the geom Xfo.  
<a name="GeomItem+toJSON"></a>

### toJSON
The toJSON method encodes this type as a json object for persistence.


**Returns**: <code>object</code> - - Returns the json object.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="GeomItem+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="GeomItem+readBinary"></a>

### readBinary
Loads state of the Item from a binary object.



| Param | Type | Description |
| --- | --- | --- |
| reader | <code>object</code> | The reader value. |
| context | <code>object</code> | The context value. |

<a name="GeomItem+toString"></a>

### toString
Returns string representation of current object's state.


**Returns**: <code>string</code> - - The return value.  
<a name="GeomItem+clone"></a>

### clone
The clone method constructs a new geom item, copies its values
from this item and returns it.


**Returns**: [<code>GeomItem</code>](#GeomItem) - - Returns a new cloned geom item.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>number</code> | The context value. |

<a name="GeomItem+copyFrom"></a>

### copyFrom
Copies current GeomItem with all its children.



| Param | Type | Description |
| --- | --- | --- |
| src | [<code>GeomItem</code>](#GeomItem) | The geom item to copy from. |
| context | <code>number</code> | The context value. |

<a name="GeomItem.setCalculatePreciseBoundingBoxes"></a>

### setCalculatePreciseBoundingBoxes
Sets the global boolean that controls if GeomItems calculate precise bounding boxes
or use the approximate bounding boxes that are much faster to generate.
Note: computing the precise bounding box is much slower and can make loading
big scenes take a bit longer. This setting is only relevant to geometries loaded
from zcad files.



| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | true for precise bounding boxes, else false for faster approximate bounding boxes. |



### [Class Tests](api/SceneTree/GeomItem.test)