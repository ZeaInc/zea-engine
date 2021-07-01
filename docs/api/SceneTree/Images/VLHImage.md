<a name="VLHImage"></a>

### VLHImage 
Class representing a VLH image.

**Parameters**
* **FilePath([`FilePathParameter`](api/SceneTree\Parameters\FilePathParameter.md)):** Used to specify the path to the file.

**Events**
* **loaded:** Triggered when image data is loaded.
* **updated:** Triggered when image data is updated.


**Extends**: <code>[BaseImage](api/SceneTree\BaseImage.md)</code>  

* [VLHImage ⇐ <code>BaseImage</code>](#VLHImage)
    * [new VLHImage(name, params)](#new-VLHImage)
    * [getDOMElement() ⇒ <code>HTMLElement</code>](#getDOMElement)
    * [getResourcePath() ⇒ <code>string</code>](#getResourcePath)
    * [load(url) ⇒ <code>Promise</code>](#load)
    * [isStream() ⇒ <code>boolean</code>](#isStream)
    * [isLoaded() ⇒ <code>boolean</code>](#isLoaded)
    * [getParams() ⇒ <code>object</code>](#getParams)
    * [toJSON(context)](#toJSON)
    * [fromJSON(json, context)](#fromJSON)
    * [readBinary(reader, context)](#readBinary)

<a name="new_VLHImage_new"></a>

### new VLHImage
Create a VLH image.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name value. |
| params | <code>object</code> | The params value. |

<a name="VLHImage+getDOMElement"></a>

### getDOMElement
Returns DOM Element.


**Returns**: <code>HTMLElement</code> - - The return value.  
<a name="VLHImage+getResourcePath"></a>

### getResourcePath
Returns `FilePath` parameter's value.


**Returns**: <code>string</code> - - The return value.  
<a name="VLHImage+load"></a>

### load
Loads a vlh file given a URL.


**Returns**: <code>Promise</code> - - Returns a promise that resolves once the initial load is complete  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL of the vlh file to load |

<a name="VLHImage+isStream"></a>

### isStream
Returns if the data is a stream or not.


**Returns**: <code>boolean</code> - - The return value.  
<a name="VLHImage+isLoaded"></a>

### isLoaded
Returns the status of the data, whether is loaded or not.


**Returns**: <code>boolean</code> - - The return value.  
<a name="VLHImage+getParams"></a>

### getParams
Returns all parameters and class state values.


**Returns**: <code>object</code> - - The return value.  
<a name="VLHImage+toJSON"></a>

### toJSON
The toJSON method encodes this type as a json object for persistence.



| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="VLHImage+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="VLHImage+readBinary"></a>

### readBinary
Sets state of current Image using a binary reader object, and adds it to the resource loader.



| Param | Type | Description |
| --- | --- | --- |
| reader | <code>[BinReader](api/SceneTree\BinReader.md)</code> | The reader value. |
| context | <code>object</code> | The context value. |

