<a name="ParameterOwner"></a>

### ParameterOwner 
Class that allows other classes to be parameterized by `Parameter` type of objects.
Not only hosting parameters, but their events.


**Extends**: <code>[EventEmitter](api/Utilities/EventEmitter.md)</code>  

* [ParameterOwner ⇐ <code>EventEmitter</code>](#ParameterOwner)
    * [new ParameterOwner()](#new-ParameterOwner)
    * ~~[.numParameters()](#ParameterOwner+numParameters) ⇒ <code>number</code>~~
    * [getNumParameters() ⇒ <code>number</code>](#getNumParameters)
    * [getParameters() ⇒ <code>array</code>](#getParameters)
    * [getParameterIndex(paramName) ⇒ <code>number</code>](#getParameterIndex)
    * [getParameterByIndex(index) ⇒ <code>Parameter</code>](#getParameterByIndex)
    * [hasParameter(paramName) ⇒ <code>boolean</code>](#hasParameter)
    * [getParameter(paramName) ⇒ <code>Parameter</code>](#getParameter)
    * [addParameter(param) ⇒ <code>Parameter</code>](#addParameter)
    * [insertParameter(param, index) ⇒ <code>Parameter</code>](#insertParameter)
    * [removeParameter(name)](#removeParameter)
    * [replaceParameter(param) ⇒ <code>Parameter</code>](#replaceParameter)
    * [toJSON(context) ⇒ <code>object</code>](#toJSON)
    * [fromJSON(j, context)](#fromJSON)
    * [readBinary(reader, context)](#readBinary)
    * [toString() ⇒ <code>string</code>](#toString)
    * [copyFrom(src, context)](#copyFrom)

<a name="new_ParameterOwner_new"></a>

### new ParameterOwner
Creates an instance of ParameterOwner by initializing parameter hosting mappings and events.
<br>
Every Object has a unique identifier which is based on a counter that is incremented.

<a name="ParameterOwner+numParameters"></a>

### ~~parameterOwner.numParameters() ⇒ <code>number</code>~~
***Deprecated***


**Returns**: <code>number</code> - - Amount of parameters in current object.  
<a name="ParameterOwner+getNumParameters"></a>

### getNumParameters
Returns the number of parameters current object has.


**Returns**: <code>number</code> - - Amount of parameters in current object.  
<a name="ParameterOwner+getParameters"></a>

### getParameters
Returns all the parameters of the object.


**Returns**: <code>array</code> - - Parameter List  
<a name="ParameterOwner+getParameterIndex"></a>

### getParameterIndex
Returns the index of a parameter in parameter list.


**Returns**: <code>number</code> - - Position in the array  

| Param | Type | Description |
| --- | --- | --- |
| paramName | <code>string</code> | Name of the parameter. |

<a name="ParameterOwner+getParameterByIndex"></a>

### getParameterByIndex
Returns `Parameter` object in a given index


**Returns**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> - - Parameter object value  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Position of the parameter in the array |

<a name="ParameterOwner+hasParameter"></a>

### hasParameter
Validates if the specified parameter exists in the object.


**Returns**: <code>boolean</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| paramName | <code>string</code> | The parameter name. |

<a name="ParameterOwner+getParameter"></a>

### getParameter
Returns `Parameter` object using the given name


**Returns**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> - - Parameter object value  

| Param | Type | Description |
| --- | --- | --- |
| paramName | <code>string</code> | The parameter name. |

<a name="ParameterOwner+addParameter"></a>

### addParameter
Adds `Parameter` object to the owner's parameter list.


**Returns**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> - - With `owner` and `valueChanged` event set.  
**Emits**: <code>event:&#x60;parameterAdded&#x60; with the name of the param.</code>  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The parameter to add. |

<a name="ParameterOwner+insertParameter"></a>

### insertParameter
Adds `Parameter` object to the owner's parameter list using the index.
It replaces the event in the specified index.


**Returns**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> - - With `owner` and `valueChanged` event set.  
**Emits**: <code>event:&#x60;parameterAdded&#x60; with the name of the param.</code>  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The parameter to insert. |
| index | <code>number</code> | The index value. |

<a name="ParameterOwner+removeParameter"></a>

### removeParameter
Removes `Parameter` from owner, by using parameter's name.


**Emits**: <code>event:&#x60;parameterRemoved&#x60; with the name of the param.</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The parameter name. |

<a name="ParameterOwner+replaceParameter"></a>

### replaceParameter
Replaces old `Parameter` by passing a new one with the same name.


**Returns**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> - - `Parameter` with `valueChanged` event set.  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The parameter to replace. |

<a name="ParameterOwner+toJSON"></a>

### toJSON
The toJSON method encodes this type as a json object for persistence.


**Returns**: <code>object</code> - - Returns the json object.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="ParameterOwner+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="ParameterOwner+readBinary"></a>

### readBinary
Uses passed in BinReader object(containing an Int32 array with all the parameters) to reconstruct all parameters state.
<br>
In each iteration of the array, propType and propName are extracted and
used to build the right `Parameter` class. Then all of them are added to the object.


**Emits**: <code>event:&#x60;parameterAdded&#x60; with the name of the param.</code>  

| Param | Type | Description |
| --- | --- | --- |
| reader | <code>[BinReader](api/SceneTree/BinReader.md)</code> | The reader value. |
| context | <code>object</code> | The context value. |

<a name="ParameterOwner+toString"></a>

### toString
Converts object's JSON value and converts it to a string.


**Returns**: <code>string</code> - - String of object's parameter list state.  
<a name="ParameterOwner+copyFrom"></a>

### copyFrom
Copies Parameters from another `ParameterOwner` to current object.



| Param | Type | Description |
| --- | --- | --- |
| src | [<code>ParameterOwner</code>](#ParameterOwner) | The ParameterOwner copy from. |
| context | <code>object</code> | The context value. |



### [Class Tests](api/SceneTree/ParameterOwner.test)