<a name="Material"></a>

### Material 
Represents a type of `BaseItem` class that holds material configuration.
Use this to apply materials to your assets or item parts.

**Events**
* **shaderNameChanged:** Triggered when the shader's name is set through `setShaderName` method.


**Extends**: <code>[BaseItem](api/SceneTree/BaseItem.md)</code>  

* [Material ⇐ <code>BaseItem</code>](#Material)
    * [new Material(name, shaderName)](#new-Material)
    * [getShaderName() ⇒ <code>string</code>](#getShaderName)
    * [setShaderName(shaderName)](#setShaderName)
    * [removeAllTextures()](#removeAllTextures)
    * [getParamTextures() ⇒ <code>object</code>](#getParamTextures)
    * [isTransparent() ⇒ <code>boolean</code>](#isTransparent)
    * [getShaderClass() ⇒ <code>string</code> \| <code>undefined</code>](#getShaderClass)
    * [modifyParams(paramValues, shaderName)](#modifyParams)
    * [toJSON(context) ⇒ <code>object</code>](#toJSON)
    * [fromJSON(j, context)](#fromJSON)
    * [readBinary(reader, context)](#readBinary)
    * [clone(context)](#clone)
    * [copyFrom(src, context)](#copyFrom)

<a name="new_Material_new"></a>

### new Material
Create a material


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the material. |
| shaderName | <code>string</code> | Shader's class name. |

<a name="Material+getShaderName"></a>

### getShaderName
Getter for the shader name.


**Returns**: <code>string</code> - - Returns the shader name.  
<a name="Material+setShaderName"></a>

### setShaderName
Sets shader by using the name of the class with the script.
It is important that the shader is registered in `Registry`, otherwise it will error.
See all classes that extend from `GLShader`.



| Param | Type | Description |
| --- | --- | --- |
| shaderName | <code>string</code> | The shader name. |

<a name="Material+removeAllTextures"></a>

### removeAllTextures
Remove all textures from Material's parameters.


<a name="Material+getParamTextures"></a>

### getParamTextures
Returns all texture parameters in current Material.


**Returns**: <code>object</code> - - The return value.  
<a name="Material+isTransparent"></a>

### isTransparent
Checks if the material is transparent by checking the `Opacity` parameter.


**Returns**: <code>boolean</code> - - Returns true if the material is transparent.  
<a name="Material+getShaderClass"></a>

### getShaderClass
Returns shader's class of current material, if set. Otherwise it returns `undefined`


**Returns**: <code>string</code> \| <code>undefined</code> - - The return value.  
<a name="Material+modifyParams"></a>

### modifyParams
Let you modify or set the shader and all the parameters of current material.



| Param | Type | Description |
| --- | --- | --- |
| paramValues | <code>object</code> | The paramValues. |
| shaderName | <code>string</code> | The shader name. |

<a name="Material+toJSON"></a>

### toJSON
The toJSON method encodes the current object as a json object.


**Returns**: <code>object</code> - - Returns the json object.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="Material+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="Material+readBinary"></a>

### readBinary
Sets state of current Item(Including Shaders and Materials) using a binary reader object.



| Param | Type | Description |
| --- | --- | --- |
| reader | <code>[BinReader](api/SceneTree/BinReader.md)</code> | The reader value. |
| context | <code>object</code> | The context value. |

<a name="Material+clone"></a>

### clone
The clone method constructs a new material, copies its values
from this material and returns it.


**Returns**: [<code>Material</code>](#Material) - - Returns a new cloned material.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="Material+copyFrom"></a>

### copyFrom
When a Material is copied, first runs `BaseItem` copyFrom method, then sets shader.



| Param | Type | Description |
| --- | --- | --- |
| src | [<code>Material</code>](#Material) | The material to copy from. |
| context | <code>object</code> | The context value. |



### [Class Tests](api/SceneTree/Material.test)