<a name="ObjAsset"></a>

### ObjAsset 
Class designed to load and handle `.obj` files.
Which define the geometry and other properties for objects.

**Parameters**
* **splitObjects([`BooleanParameter`](api/SceneTree/Parameters/BooleanParameter.md)):** _todo_
* **splitGroupsIntoObjects([`BooleanParameter`](api/SceneTree/Parameters/BooleanParameter.md)):** _todo_
* **loadMtlFile([`BooleanParameter`](api/SceneTree/Parameters/BooleanParameter.md)):** _todo_
* **unitsConversion([`NumberParameter`](api/SceneTree/Parameters/NumberParameter.md)):** _todo_
* **defaultShader([`StringParameter`](api/SceneTree/Parameters/StringParameter.md)):** _todo_
* **ObjFilePath([`FilePathParameter`](api/SceneTree/Parameters/FilePathParameter.md)):** Used to specify the path to the file.

**Events**
* **loaded:** Triggered once everything is loaded.
* **geomsLoaded:** Triggered once all geometries are loaded.


**Extends**: <code>[AssetItem](api/SceneTree/AssetItem.md)</code>  

* [ObjAsset ⇐ <code>AssetItem</code>](#ObjAsset)
    * [new ObjAsset(name)](#new-ObjAsset)
    * [getGeometryLibrary() ⇒ <code>GeomLibrary</code>](#getGeometryLibrary)
    * [getMaterialLibrary() ⇒ <code>MaterialLibrary</code>](#getMaterialLibrary)

<a name="new_ObjAsset_new"></a>

### new ObjAsset
Create an obj asset.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the object asset. |

<a name="ObjAsset+getGeometryLibrary"></a>

### getGeometryLibrary
Returns `GeomLibrary` object which hosts workers, buffers, streams and geometry objects.


**Returns**: <code>[GeomLibrary](api/SceneTree/GeomLibrary.md)</code> - - The return value.  
<a name="ObjAsset+getMaterialLibrary"></a>

### getMaterialLibrary
Returns `MaterialLibrary` object wich hosts images and `Material` objects.


**Returns**: <code>[MaterialLibrary](api/SceneTree/MaterialLibrary.md)</code> - - The return value.  
