<a name="Xfo"></a>

### Xfo
Class representing an Xfo transform.


**See**: [`setFromOther`](#setFromOther) [`fromMat4`](#fromMat4) [`setFromFloat32Array`](#setFromFloat32Array) [`fromJSON`](#fromJSON)  

* [Xfo](#Xfo)
    * [new Xfo(tr, ori, sc)](#new-Xfo)
    * [set(tr, ori, sc)](#set)
    * [setFromOther(other)](#setFromOther)
    * [isIdentity() ⇒ <code>boolean</code>](#isIdentity)
    * [setLookAt(pos, target, up)](#setLookAt)
    * [multiply(xfo)](#multiply)
    * [inverse()](#inverse)
    * [transformVec3(vec3) ⇒ <code>Vec3</code>](#transformVec3)
    * [toMat4() ⇒ <code>Mat4</code>](#toMat4)
    * [fromMat4(mat4)](#fromMat4)
    * [setFromFloat32Array(float32array)](#setFromFloat32Array)
    * [clone()](#clone)
    * [toJSON() ⇒ <code>object</code>](#toJSON)
    * [fromJSON(j)](#fromJSON)
    * [toString() ⇒ <code>string</code>](#toString)

<a name="new_Xfo_new"></a>

### new Xfo
Initializes the Xfo object.
<br>
**Note:** You can leave it empty and use other methods ti set the state of the class.


| Param | Type | Description |
| --- | --- | --- |
| tr | <code>Float32Array</code> \| <code>Vec3</code> | The translation value. |
| ori | <code>Quat</code> | The orientation value. |
| sc | <code>Vec3</code> | The scaling value. |

<a name="Xfo+set"></a>

### set
Sets the state of the Xfo object.



| Param | Type | Description |
| --- | --- | --- |
| tr | <code>Vec3</code> | The translation value. |
| ori | <code>Quat</code> | The orientation value. |
| sc | <code>Vec3</code> | The scaling value. |

<a name="Xfo+setFromOther"></a>

### setFromOther
Sets the state of the Xfo object using another Xfo object.



| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Xfo</code>](#Xfo) | The other Xfo to set from. |

<a name="Xfo+isIdentity"></a>

### isIdentity
Verifies that the Xfo object is an `identity`, checking that the translation, orientation and scaling attributes are in their initial state.


**Returns**: <code>boolean</code> - - The return value.  
<a name="Xfo+setLookAt"></a>

### setLookAt
The setLookAt method.



| Param | Type | Description |
| --- | --- | --- |
| pos | <code>Vec3</code> | The position value. |
| target | <code>Vec3</code> | The target value. |
| up | <code>Vec3</code> | The up value. |

<a name="Xfo+multiply"></a>

### multiply
Multiplies two Xfo transforms.


**Returns**: [<code>Xfo</code>](#Xfo) - - Returns an Xfo.  

| Param | Type | Description |
| --- | --- | --- |
| xfo | [<code>Xfo</code>](#Xfo) | The xfo to multiply with. |

<a name="Xfo+inverse"></a>

### inverse
Returns the inverse of the Xfo object, but returns. the result as a new Xfo.


**Returns**: [<code>Xfo</code>](#Xfo) - - Returns a new Xfo.  
<a name="Xfo+transformVec3"></a>

### transformVec3
Tranforms Xfo object using a `Vec3` object. First scaling it, then rotating and finally adding the result to current translation object.


**Returns**: <code>Vec3</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| vec3 | <code>Vec3</code> | The vec3 value. |

<a name="Xfo+toMat4"></a>

### toMat4
Converts this Xfo to a Mat4 (a 4x4 matrix).


**Returns**: <code>Mat4</code> - - Returns a new Mat4.  
<a name="Xfo+fromMat4"></a>

### fromMat4
Sets the state of the Xfo object using Mat4.



| Param | Type | Description |
| --- | --- | --- |
| mat4 | <code>Mat4</code> | The mat4 value. |

<a name="Xfo+setFromFloat32Array"></a>

### setFromFloat32Array
Sets the state of the Xfo object using an `Float32array`.
<br>
**Note:** You can set the byteOffset in your `Float32array` object



| Param | Type | Description |
| --- | --- | --- |
| float32array | <code>Float32Array</code> | The float32array value. |

<a name="Xfo+clone"></a>

### clone
Clones this Xfo and returns a new Xfo.


**Returns**: [<code>Xfo</code>](#Xfo) - - Returns a new Xfo.  
<a name="Xfo+toJSON"></a>

### toJSON
The toJSON method encodes this type as a json object for persistence.


**Returns**: <code>object</code> - - The json object.  
<a name="Xfo+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object. |

<a name="Xfo+toString"></a>

### toString
The fromJSON method decodes a json object for this type.


**Returns**: <code>string</code> - - The return value.  
