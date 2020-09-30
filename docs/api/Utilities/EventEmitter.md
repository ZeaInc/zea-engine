<a name="EventEmitter"></a>

### EventEmitter
Provides an interface for emitting events under given names, and registering listeners to those events.
This is a base class for most classes in the Scene Tree and Renderer, enabling observers to listen to changes throughout the system.
The interface exposed is similar to [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) in Node.

Similar to how the DOM event system in the browser works, events are registered by name.
Example: Registering a listener for a custom event, and then emitting that event.
```javascript
 const ee = new EventEmitter()

 ee.on('myEvent', (event) => {
   console.log('My Event was emitted:', event)
 })

 ee.emit('myEvent', { data: 42 })
```



* [EventEmitter](#EventEmitter)
    * [new EventEmitter()](#new-EventEmitter)
    * [on(eventName, listener) ⇒ <code>number</code>](#on)
    * [once(eventName, listener)](#once)
    * [off(eventName, listener)](#off)
    * ~~[.addListener(eventName, listener)](#EventEmitter+addListener) ⇒ <code>number</code>~~
    * ~~[.removeListener(eventName, listener)](#EventEmitter+removeListener)~~
    * ~~[.removeListenerById(eventName, id)](#EventEmitter+removeListenerById)~~
    * [emit(eventName, event)](#emit)

<a name="new_EventEmitter_new"></a>

### new EventEmitter
Initializes an empty `listeners` map that will host all the events,
which implies that it doesn't allow multiple events with the same name.
<br>

<a name="EventEmitter+on"></a>

### on
Adds a listener function for a given event name.


**Returns**: <code>number</code> - - Id to reference the listener.  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| listener | <code>function</code> | The listener function(callback). |

<a name="EventEmitter+once"></a>

### once
Similar to the `on` method with the difference that when the event is triggered,
it is automatically unregistered meaning that the event listener will be triggered at most one time.

Useful for events that we expect to trigger one time, such as when assets load.
```javascript
const asset = new Asset();
asset.once('loaded', () => {
  console.log("Yay! the asset is loaded")
})
```



| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The eventName value |
| listener | <code>function</code> | The listener value |

<a name="EventEmitter+off"></a>

### off
Removes a listener function from the specified event, using either the function or the index id. Depends on what is passed in.



| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| listener | <code>function</code> \| <code>number</code> | The listener function or the id number. |

<a name="EventEmitter+addListener"></a>

### ~~eventEmitter.addListener(eventName, listener) ⇒ <code>number</code>~~
***Deprecated***


**Returns**: <code>number</code> - - Id to reference the listener.  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| listener | <code>function</code> | The listener function(callback). |

<a name="EventEmitter+removeListener"></a>

### ~~eventEmitter.removeListener(eventName, listener)~~
***Deprecated***



| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| listener | <code>function</code> | The listener function. |

<a name="EventEmitter+removeListenerById"></a>

### ~~eventEmitter.removeListenerById(eventName, id)~~
***Deprecated***



| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| id | <code>number</code> | The id returned by addListener |

<a name="EventEmitter+emit"></a>

### emit
Triggers all listener functions in an event.



| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | The name of the event. |
| event | <code>object</code> \| <code>string</code> \| <code>any</code> | The data you want to pass down to all listener functions as parameter. |



### [Class Tests](api/Utilities/EventEmitter.test)