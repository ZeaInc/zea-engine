<a name="BaseItem"></a>

### BaseItem 
Base class for Items in the scene. It can be parameterized and can emit events.

**Events**
* **nameChanged:** Emitted every time the Item's name is change. mostly in `setName` method.
* **selectedChanged:** Emitted `selected` status changes, mostly in `setSelected` method.


**Extends**: <code>[ParameterOwner](api/SceneTree/ParameterOwner.md)</code>  

* [BaseItem ⇐ <code>ParameterOwner</code>](#BaseItem)
    * [new BaseItem(name)](#new-BaseItem)
    * _instance_
        * [getName() ⇒ <code>string</code>](#getName)
        * [setName(name)](#setName)
        * [getPath() ⇒ <code>array</code>](#getPath)
        * [resolvePath(path, index) \| <code>Parameter</code>](#resolvePath)
        * [getOwner() ⇒ <code>object</code>](#getOwner)
        * [setOwner(ownerItem)](#setOwner)
        * [getSelectable() ⇒ <code>boolean</code>](#getSelectable)
        * [setSelectable(val) ⇒ <code>boolean</code>](#setSelectable)
        * ~~[.isSelected()](#BaseItem+isSelected) ⇒ <code>boolean</code>~~
        * [getSelected() ⇒ <code>boolean</code>](#getSelected)
        * [setSelected(sel)](#setSelected)
        * [getMetadata(key) ⇒ <code>object</code> \| <code>string</code> \| <code>any</code>](#getMetadata)
        * [hasMetadata(key) ⇒ <code>boolean</code>](#hasMetadata)
        * [setMetadata(key, metaData)](#setMetadata)
        * [deleteMetadata(key)](#deleteMetadata)
        * [toJSON(context) ⇒ <code>object</code>](#toJSON)
        * [fromJSON(j, context)](#fromJSON)
        * [readBinary(reader, context)](#readBinary)
        * [clone(context)](#clone)
        * [copyFrom(src, context)](#copyFrom)
    * _static_
        * [getNumBaseItems() ⇒ <code>number</code>](#getNumBaseItems)

<a name="new_BaseItem_new"></a>

### new BaseItem
Create a base item by defining its name.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the base item. |

<a name="BaseItem+getName"></a>

### getName
Returns the name of the base item.


**Returns**: <code>string</code> - - Returns the base item name.  
<a name="BaseItem+setName"></a>

### setName
Sets the name of the base item(Updates path).


**Emits**: <code>event:&#x60;nameChanged&#x60; with &#x60;newName&#x60; and &#x60;oldName&#x60; data.</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The base item name. |

<a name="BaseItem+getPath"></a>

### getPath
Returns the current path of the item in the tree as an array of names.


**Returns**: <code>array</code> - - Returns an array.  
<a name="BaseItem+resolvePath"></a>

### resolvePath
The resolvePath method traverses the subtree from this item down
matching each name in the path with a child until it reaches the
end of the path.


**Returns**: [<code>BaseItem</code>](#BaseItem) \| <code>Parameter</code> - - The return value.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>array</code> |  | The path value. |
| index | <code>number</code> | <code>0</code> | The index value. |

<a name="BaseItem+getOwner"></a>

### getOwner
The getOwner method returns the current owner of the item.
The item is a child of the current owner.


**Returns**: <code>object</code> - - Returns the current owner.  
<a name="BaseItem+setOwner"></a>

### setOwner
The setOwner method assigns a new owner to the item.



| Param | Type | Description |
| --- | --- | --- |
| ownerItem | <code>object</code> | The new owner item. |

<a name="BaseItem+getSelectable"></a>

### getSelectable
Returns a boolean indicating if this item is selectable.


**Returns**: <code>boolean</code> - - Returns a boolean indicating if the item is selectable.  
<a name="BaseItem+setSelectable"></a>

### setSelectable
Modifies the selectability of this item.


**Returns**: <code>boolean</code> - - Returns true if value changed.  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>boolean</code> | A boolean indicating the selectability of the item. |

<a name="BaseItem+isSelected"></a>

### ~~baseItem.isSelected() ⇒ <code>boolean</code>~~
***Deprecated***

The isSelected method.


**Returns**: <code>boolean</code> - - The return value.  
**See**: `getSelected` method  
<a name="BaseItem+getSelected"></a>

### getSelected
Returns `true` if this item has been selected.


**Returns**: <code>boolean</code> - - The current selection state.  
<a name="BaseItem+setSelected"></a>

### setSelected
Changes the current state of the selection of this item.


**Emits**: <code>event:&#x60;selectedChanged&#x60; with selected state</code>  

| Param | Type | Description |
| --- | --- | --- |
| sel | <code>boolean</code> | Boolean indicating the new selection state. |

<a name="BaseItem+getMetadata"></a>

### getMetadata
Gets Item's meta-data value by passing the `key` string.


**Returns**: <code>object</code> \| <code>string</code> \| <code>any</code> - - Returns the metadata associated with the given key.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The key value under which to check for metadata. |

<a name="BaseItem+hasMetadata"></a>

### hasMetadata
Checks to see if there is metadata for a given key.


**Returns**: <code>boolean</code> - - Returns `true` if metadata exists under the given key, otherwise returns `false`.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The key value under which to check for metadata. |

<a name="BaseItem+setMetadata"></a>

### setMetadata
Assigns metadata to a given key.



| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The key value under which the metadata is is going to be saved. |
| metaData | <code>object</code> | The metaData value. |

<a name="BaseItem+deleteMetadata"></a>

### deleteMetadata
Removes metadata for a given key.



| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The key value. |

<a name="BaseItem+toJSON"></a>

### toJSON
Encodes the current object as a json object.


**Returns**: <code>object</code> - - Returns the json object.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="BaseItem+fromJSON"></a>

### fromJSON
Decodes a json object for this type.



| Param | Type | Description |
| --- | --- | --- |
| j | <code>object</code> | The json object this item must decode. |
| context | <code>object</code> | The context value. |

<a name="BaseItem+readBinary"></a>

### readBinary
Sets state of current Item(Including parameters) using a binary reader object.



| Param | Type | Description |
| --- | --- | --- |
| reader | <code>[BinReader](api/SceneTree/BinReader.md)</code> | The reader value. |
| context | <code>object</code> | The context value. |

<a name="BaseItem+clone"></a>

### clone
Clones this base item and returns a new base item.
<br>
**Note:** Each class should implement clone to be clonable.



| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | The context value. |

<a name="BaseItem+copyFrom"></a>

### copyFrom
When a BaseItem is cloned, initially the constructor is
called to generate a new instance. This instance then copies
its values from the source using this method.
This method copies any relevant data from the source object to
ensure that it represents a valid clone.
Derived classes override this method to copy any relevant
data from the source object.



| Param | Type | Description |
| --- | --- | --- |
| src | [<code>BaseItem</code>](#BaseItem) | The BaseItem to copy from. |
| context | <code>object</code> | The context value. |

<a name="BaseItem.getNumBaseItems"></a>

### getNumBaseItems
The getNumBaseItems method returns the total number of base items created.
This method is used in debugging memory consumption.


**Returns**: <code>number</code> - - Returns the total number of base items created.  


### [Class Tests](api/SceneTree/BaseItem.test)