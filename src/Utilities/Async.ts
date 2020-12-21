/* eslint-disable require-jsdoc */
import { EventEmitter } from './EventEmitter.js'

// Note: this class will be deprecated soon.
// Please avoid using it in your code.
class Async extends EventEmitter {
  __asyncCount: any;
  __asyncsCompleted: any;
  decAsyncCount: any;
  incAsyncCount: any;
  ready: any;
  constructor(asyncCount = 0) {
    super()
    this.__asyncCount = asyncCount
    this.ready = false

    this.incAsyncCount = (count = 1) => {
      this.__asyncCount += count
      this.ready = false
    }

    this.decAsyncCount = () => {
      if (this.__asyncCount > 0) {
        this.__asyncCount--
        if (this.__asyncCount == 0) {
          this.__asyncsCompleted()
        }
      }
    }

    this.__asyncsCompleted = () => {
      this.emit('ready', {})
    }
  }

  get count() {
    return this.__asyncCount
  }
}

export { Async }
