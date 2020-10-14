<a name="ListParameter"></a>

### ListParameter 
A Parameter for storing list(array) values.

i.e.:
```javascript
const listParam = new ListParameter('MyList', GearParameter)
//'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
// Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
myParameterOwnerItem.addParameter(listParam)
```

**Events**
* **valueChanged:** Triggered when setting a value changes in the array(insert, add, remove).
* **elementAdded:** Triggered when an element is added to the array(add, insert).
* **elementRemoved:** Triggered when an element is removed from the array


**Extends**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code>  

* [ListParameter ⇐ <code>Parameter</code>](#ListParameter)
    * [new ListParameter(name, dataType)](#new-ListParameter)
    * [getCount() ⇒ <code>number</code>](#getCount)
    * [getElement(index) ⇒ <code>Parameter</code> \| <code>string</code>](#getElement)
    * [setElement(index, value)](#setElement)
    * [addElement(elem) ⇒ <code>string</code> \| <code>Parameter</code>](#addElement)
    * [removeElement(index)](#removeElement)
    * [insertElement(index, elem)](#insertElement)
    * [toJSON(context) ⇒ <code>object</code>](#toJSON)
    * [fromJSON(j, context)](#fromJSON)
    * [clone()](#clone)
    * [destroy()](#destroy)

<a name="new_ListParameter_new"></a>

### new ListParameter
Create a list parameter.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the list parameter. |
| dataType | <code>string</code> \| <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The dataType value. |

<a name="ListParameter+getCount"></a>

### getCount
Returns the count of items in the array.


**Returns**: <code>number</code> - - The return value.  
<a name="ListParameter+getElement"></a>

### getElement
Returns value from the array in the specified index.


**Returns**: <code>Parameter</code> \| <code>string</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index value. |

<a name="ListParameter+setElement"></a>

### setElement
Sets a value in the specified array's index.



| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index value. |
| value | <code>string</code> \| <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The value value. |

<a name="ListParameter+addElement"></a>

### addElement
Adds a new element at the end of the array pile.


**Returns**: <code>string</code> \| <code>Parameter</code> - - The return value.  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>string</code> \| <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The elem value. |

<a name="ListParameter+removeElement"></a>

### removeElement
Removes an array element from the specified index



| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index value. |

<a name="ListParameter+insertElement"></a>

### insertElement
Inserts a new element in the specified index.



| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index value. |
| elem | <code>string</code> \| <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code> | The elem value. |

<a name="ListParameter+toJSON"></a>

### toJSON
The toJSON method encodes this type as a json object for persistence.


**Returns**: <code>object</code> - - Returns the json object.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="ListParameter+fromJSON"></a>

### fromJSON
The fromJSON method decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="ListParameter+clone"></a>

### clone
The clone method constructs a new list parameter, copies its values
from this parameter and returns it.


**Returns**: [<code>ListParameter</code>](#ListParameter) - - Returns a new list parameter.  
<a name="ListParameter+destroy"></a>

### destroy
The destroy is called by the system to cause explicit resources cleanup.
Users should never need to call this method directly.




### [Class Tests](api/SceneTree/Parameters/ListParameter.test)