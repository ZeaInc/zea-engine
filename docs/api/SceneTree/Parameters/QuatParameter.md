<a name="QuatParameter"></a>

### QuatParameter 
Represents a specific type of parameter, that only stores Vec3(four-dimensional coordinate) values.

i.e.:
```javascript
const quatParam = new QuatParameter('MyQuat', new Quat(1.2, 3.4, 1, 4.2))
//'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
// Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
myParameterOwnerItem.addParameter(quatParam)
```


**Extends**: <code>[Parameter](api/SceneTree/Parameters/Parameter.md)</code>  

* [QuatParameter ⇐ <code>Parameter</code>](#QuatParameter)
    * [new QuatParameter(name, value)](#new-QuatParameter)
    * [readBinary(reader, context)](#readBinary)
    * [clone()](#clone)

<a name="new_QuatParameter_new"></a>

### new QuatParameter
Create a Quat parameter.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the Quat parameter. |
| value | <code>[Quat](api/Math/Quat.md)</code> | The value of the parameter. |

<a name="QuatParameter+readBinary"></a>

### readBinary
Extracts a number value from a buffer, updating current parameter state.



| Param | Type | Description |
| --- | --- | --- |
| reader | <code>[BinReader](api/SceneTree/BinReader.md)</code> | The reader value. |
| context | <code>object</code> | The context value. |

<a name="QuatParameter+clone"></a>

### clone
The clone method constructs a new Quat parameter, copies its values
from this parameter and returns it.


**Returns**: [<code>QuatParameter</code>](#QuatParameter) - - Returns a new Quat parameter.  


### [Class Tests](api/SceneTree/Parameters/QuatParameter.test)