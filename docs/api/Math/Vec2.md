<a name="Vec2"></a>

### Vec2 
Representing a Vec2(two-dimensional floating point vector). A Vec2 is for representing 2 dimensional values, such as screen coordinates or pixel coordinates within an image.

Math types internally store values in [Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) and
expose getters and setters for the component values.


**Extends**: <code>AttrValue</code>  

* [Vec2 ⇐ <code>AttrValue</code>](#Vec2)
    * [new Vec2(x, y)](#new-Vec2)
    * [x ⇒ <code>number</code>](#x)
    * [x](#x)
    * [y ⇒ <code>number</code>](#y)
    * [y](#y)
    * [set(x, y)](#set)
    * [setFromOther(other)](#setFromOther)
    * ~~[.equal(other)](#Vec2+equal) ⇒ <code>boolean</code>~~
    * [isEqual(other) ⇒ <code>boolean</code>](#isEqual)
    * ~~[.notEquals(other)](#Vec2+notEquals) ⇒ <code>boolean</code>~~
    * [notEqual(other) ⇒ <code>boolean</code>](#notEqual)
    * [approxEqual(other, precision) ⇒ <code>boolean</code>](#approxEqual)
    * [add(other)](#add)
    * [addInPlace(other)](#addInPlace)
    * [subtract(other)](#subtract)
    * [subtractInPlace(other)](#subtractInPlace)
    * [scale(scalar)](#scale)
    * [scaleInPlace(scalar)](#scaleInPlace)
    * [invert()](#invert)
    * [invertInPlace()](#invertInPlace)
    * [multiply(other)](#multiply)
    * [multiplyInPlace(other)](#multiplyInPlace)
    * [lengthSquared() ⇒ <code>number</code>](#lengthSquared)
    * [length() ⇒ <code>number</code>](#length)
    * [distanceTo(other) ⇒ <code>number</code>](#distanceTo)
    * [normalize()](#normalize)
    * [normalizeInPlace()](#normalizeInPlace)
    * [dot(other) ⇒ <code>number</code>](#dot)
    * [cross(other) ⇒ <code>number</code>](#cross)
    * [angleTo(other) ⇒ <code>number</code>](#angleTo)
    * [signedAngleTo(other) ⇒ <code>number</code>](#signedAngleTo)
    * [rotate(angle)](#rotate)
    * [lerp(other, t)](#lerp)
    * [setRandomDir(scale)](#setRandomDir)
    * [setRandom(scale)](#setRandom)
    * [clone()](#clone)
    * [asArray() ⇒ <code>array</code>](#asArray)
    * [toJSON() ⇒ <code>object</code>](#toJSON)
    * [fromJSON(j)](#fromJSON)

<a name="new_Vec2_new"></a>

### new Vec2
Creates a Vec2.

The type of values of the `(x, y)` coordinates can be [Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array),
[Uint32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array),
[Int32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array) and
[ArrayBuffer](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/ArrayBuffer).
<br>

```javascript
 const myVec2 = new Vec2(1.2, 3.4)
```

Given an array of floats, create a Vec2 that wraps some part of it.
```javascript
 const floatArray = new Float32Array(6)
 floatArray[0] = 1.2
 floatArray[1] = 3.4
 const myVec2 = new Vec2(floatArray)
 console.log(myVec2.toJSON())
```
The resulting output
```json
 > { x:1.2, y:3.4 }
```

Given an array of floats, create a Vec2 that wraps some part of it.
```javascript
 const floatArray = new Float32Array(6)
 floatArray[0] = 1.2
 floatArray[1] = 3.4
 floatArray[2] = 5.6
 floatArray[3] = 7.8
 floatArray[4] = 9.0
 floatArray[5] = 1.9
 const myVec2 = new Vec2(floatArray.buffer, 8)
 console.log(myVec2.toJSON())
```
The resulting output
```json
 > { x:5.6, y:7.8 }
```

You can also pass one JSON object parameter.
```javascript
 const myVec2 = new Vec2({ x:1.2, y:3.4 })
```


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>Number</code> \| <code>Float32Array</code> \| <code>Uint32Array</code> \| <code>json</code> | <code>0</code> | The x value. Default is 0. |
| y | <code>Number</code> | <code>0</code> | The y value. Default is 0. |

<a name="Vec2+x"></a>

### x 
Getter for `x` component.


**Returns**: <code>number</code> - - Returns the x component.  
<a name="Vec2+x"></a>

### x
Setter for `x` component.



| Param | Type | Description |
| --- | --- | --- |
| val | <code>number</code> | The val param. |

<a name="Vec2+y"></a>

### y 
Getter for `y` component.


**Returns**: <code>number</code> - - Returns the y component.  
<a name="Vec2+y"></a>

### y
Setter for `y` component.



| Param | Type | Description |
| --- | --- | --- |
| val | <code>number</code> | The val param. |

<a name="Vec2+set"></a>

### set
Setter from scalar components.



| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The x component. |
| y | <code>number</code> | The y component. |

<a name="Vec2+setFromOther"></a>

### setFromOther
Replaces this Vec2 data with the Vec2 data passed as parameter.



| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to set from. |

<a name="Vec2+equal"></a>

### ~~vec2.equal(other) ⇒ <code>boolean</code>~~
***Deprecated***

Checks if this Vec2 is exactly the same as another Vec2.


**Returns**: <code>boolean</code> - - Returns `true` if are the same Vector, otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+isEqual"></a>

### isEqual
Checks if this Vec2 is exactly the same as another Vec2.


**Returns**: <code>boolean</code> - - Returns `true` if are the same Vector, otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+notEquals"></a>

### ~~vec2.notEquals(other) ⇒ <code>boolean</code>~~
***Deprecated***

Checks if this Vec2 is different from another Vec2.


**Returns**: <code>boolean</code> - - Returns `true` if the Vec2s are different, otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+notEqual"></a>

### notEqual
Checks if this Vec2 is different from another Vec2.


**Returns**: <code>boolean</code> - - Returns `true` if the Vec2s are different, otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+approxEqual"></a>

### approxEqual
Returns true if this Vec2 is approximately the same as other.


**Returns**: <code>boolean</code> - - Returns true or false.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |
| precision | <code>number</code> | The precision to which the values must match. |

<a name="Vec2+add"></a>

### add
Adds other to this Vec2 and returns the result as a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to add. |

<a name="Vec2+addInPlace"></a>

### addInPlace
Adds a Vec2 to this Vec2.



| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to add. |

<a name="Vec2+subtract"></a>

### subtract
Subtracts a Vec2 from this Vec2 and returns the result as a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to subtract. |

<a name="Vec2+subtractInPlace"></a>

### subtractInPlace
Subtracts a Vec2 from this Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to subtract. |

<a name="Vec2+scale"></a>

### scale
Scales this Vec2 by scalar and returns the result as a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| scalar | <code>number</code> | The scalar value. |

<a name="Vec2+scaleInPlace"></a>

### scaleInPlace
Scales this Vec2 by scalar.



| Param | Type | Description |
| --- | --- | --- |
| scalar | <code>number</code> | The scalar value. |

<a name="Vec2+invert"></a>

### invert
Inverts this Vec2 and returns the result as a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  
<a name="Vec2+invertInPlace"></a>

### invertInPlace
Inverts this Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - The return value.  
<a name="Vec2+multiply"></a>

### multiply
Multiplies a Vec2 with this Vec2 and returns the result as a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to multiply with. |

<a name="Vec2+multiplyInPlace"></a>

### multiplyInPlace
Multiplies a Vec2 with this Vec2.



| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to multiply with. |

<a name="Vec2+lengthSquared"></a>

### lengthSquared
Calculates the squared length of this Vec2.


**Returns**: <code>number</code> - - Returns the length squared.  
<a name="Vec2+length"></a>

### length
Calculates the length of this Vec2.


**Returns**: <code>number</code> - - Returns the length.  
<a name="Vec2+distanceTo"></a>

### distanceTo
Calculates the distance to another vector.


**Returns**: <code>number</code> - - Returns the distance between vectors.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other value. |

<a name="Vec2+normalize"></a>

### normalize
Normalizes the Vec2 and returns it as a new Vec2.
Multiplies coordenates value by the inverse of the vector length.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns the Vec2 normalized.  
<a name="Vec2+normalizeInPlace"></a>

### normalizeInPlace
Normalizes this Vec2 multiplying coordenate values by the inverse of the vector length.


<a name="Vec2+dot"></a>

### dot
Calculates the dot product of this Vec2 against another Vec2.


**Returns**: <code>number</code> - - Returns the dot product.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+cross"></a>

### cross
Calculates the cross product of this Vec2 against another Vec2.


**Returns**: <code>number</code> - - Returns the cross product.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+angleTo"></a>

### angleTo
Gets the angle between this Vec2 and other assuming both are normalized vectors.


**Returns**: <code>number</code> - - Returns the angle in radians.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+signedAngleTo"></a>

### signedAngleTo
Gets the angle between this Vec2 and other.


**Returns**: <code>number</code> - - Returns the angle in radians.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to compare with. |

<a name="Vec2+rotate"></a>

### rotate
Rotates a Vec2 in a clockwise direction and returns a new rotated Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns the rotated vect  or.  

| Param | Type | Description |
| --- | --- | --- |
| angle | <code>number</code> | The angle of rotation. |

<a name="Vec2+lerp"></a>

### lerp
Performs a linear interpolation between this Vec2 and other Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other Vec2 to interpolate between. |
| t | <code>number</code> | Interpolation amount between the two inputs. |

<a name="Vec2+setRandomDir"></a>

### setRandomDir
Generates a random vector with the given scale.


**Returns**: [<code>Vec2</code>](#Vec2) - - The return value.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| scale | <code>number</code> | <code>1</code> | Length of the resulting vector. If ommitted, a unit vector will be returned. |

<a name="Vec2+setRandom"></a>

### setRandom
Randomizes the scale of this Vec2 coordenates.


**Returns**: [<code>Vec2</code>](#Vec2) - - The return value.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| scale | <code>number</code> | <code>1</code> | The scale value. |

<a name="Vec2+clone"></a>

### clone
Clones this Vec2 and returns a new Vec2.


**Returns**: [<code>Vec2</code>](#Vec2) - - Returns a new Vec2.  
<a name="Vec2+asArray"></a>

### asArray
Returns current Vec2 data as array. Often used to pass types to the GPU.


**Returns**: <code>array</code> - - Returns as an array.  
<a name="Vec2+toJSON"></a>

### toJSON
Encodes Vec2 Class as a JSON object for persistence.


**Returns**: <code>object</code> - - The json object.  
<a name="Vec2+fromJSON"></a>

### fromJSON
Decodes a JSON object to set the state of this class.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object. |

