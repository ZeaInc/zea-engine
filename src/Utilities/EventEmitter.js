/**
 * Provides an interface for emitting events under given names, and registering listeners to those events.
 * This is a base class for most classes in the Scene Tree and Renderer, enabling observers to listen to changes throughout the system.
 * The interface exposed is similar to [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) in Node.
 *
 * Similar to how the DOM event system in the browser works, events are registered by name.
 * Example: Registering a listener for a custom event, and then emitting that event.
 * ```javascript
 *  const ee = new EventEmitter()
 * 
 *  ee.on('myEvent', (event) => {
 *    console.log('My Event was emitted:', event)
 *  })
 * 
 *  ee.emit('myEvent', { data: 42 })
 * ```
 * 
 * 
 */
class EventEmitter {
  /**
   * Initializes an empty `listeners` map that will host all the events,
   * which implies that it doesn't allow multiple events with the same name.
   * <br>
   */
  constructor() {
    this.listeners = {}
  }

  /**
   * Adds a listener function for a given event name.
   *
   * @param {string} eventName - The name of the event.
   * @param {function} listener - The listener function(callback).
   * @return {number} - Id to reference the listener.
   */
  on(eventName, listener) {
    if (!listener) {
      throw new Error('Missing callback function (listener).')
    }

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    const listeners = this.listeners[eventName]

    if (listeners.indexOf(listener) != -1) {
      throw new Error(`Listener "${listener.name}" already connected to event "${eventName}".`)
    }

    // TODO: Deprecate alongside #addListener.
    const id = listeners.length
    listeners[id] = listener

    return id
  }

  /**
   * Similar to the `on` method with the difference that when the event is triggered,
   * it is automatically unregistered meaning that the event listener will be triggered at most one time.
   *
   * Useful for events that we expect to trigger one time, such as when assets load.
   * ```javascript
   * const asset = new Asset();
   * asset.once('loaded', () => {
   *   console.log("Yay! the asset is loaded")
   * })
   * ```
   *
   */
  once(eventName, listener) {
    const cb = (event) => {
      listener(event)
      this.off(eventName, cb)
    }

    this.on(eventName, cb)
  }

  /**
   * Removes a listener function from the specified event, using either the function or the index id. Depends on what is passed in.
   *
   * @param {string} eventName - The name of the event.
   * @param {function|number} listener - The listener function or the id number.
   */
  off(eventName, listener) {
    if (!listener) {
      throw new Error('Missing callback function (listener).')
    }

    if (typeof listener == 'number') {
      console.warn('Deprecated. Un-register using the original listener instead.')
      this.removeListenerById(eventName, listener)
      return
    }

    const listeners = this.listeners[eventName] || []

    const ids = []

    listeners.forEach((e, i) => {
      if (e === listener) {
        ids.push(i)
      }
    })

    if (ids.length == 0) {
      throw new Error(`Listener "${listener.name}" is not connected to "${eventName}" event`)
    } else {
      for (const id of ids) {
        listeners[id] = undefined
      }
    }
  }

  /**
   * @deprecated Use #on instead.
   *
   * @param {string} eventName - The name of the event.
   * @param {function} listener - The listener function(callback).
   * @return {number} - Id to reference the listener.
   */
  addListener(eventName, listener) {
    console.warn('Deprecated. Use #on instead.')

    return this.on(eventName, listener)
  }

  /**
   * @deprecated Use #off instead.
   *
   * @param {string} eventName - The name of the event.
   * @param {function} listener - The listener function.
   */
  removeListener(eventName, listener) {
    console.warn('Deprecated. Use #off instead.')

    this.off(eventName, listener)
  }

  /**
   * @deprecated Use #off, passing the listener itself instead of the id.
   *
   * @param {string} eventName - The name of the event.
   * @param {number} id - The id returned by addListener
   */
  removeListenerById(eventName, id) {
    console.warn('Deprecated. Use #off, passing the listener itself instead of the id.')

    const listeners = this.listeners[eventName]

    if (!listeners) {
      console.warn('callback :' + id + ' was not connected to this signal:' + eventName)
      return
    }

    if (!listeners[id]) throw new Error('Invalid ID')

    listeners[id] = undefined
  }

  /**
   * Triggers all listener functions in an event.
   *
   * @param {string} eventName - The name of the event.
   * @param {object|string|any} event - The data you want to pass down to all listener functions as parameter.
   */
  emit(eventName, event) {
    const listeners = this.listeners[eventName] || []

    listeners.forEach((fn) => {
      // Skip disconnected listeners.
      if (fn) {
        fn(event)
      }
    })
  }
}

export { EventEmitter }
