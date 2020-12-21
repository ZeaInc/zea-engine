import { EventEmitter } from './EventEmitter'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EventEmitter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('fails when trying to register a callback but no callback was passed.', () => {
    const eventEmitter = new EventEmitter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      eventEmitter.on('fake')
    }).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("doesn't allow duplication.", () => {
    const eventEmitter = new EventEmitter()

    const cb = () => {}

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => {
      eventEmitter.on('fake', cb)
      eventEmitter.on('fake', cb)
    }).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls the listener at least once.', () => {
    const eventEmitter = new EventEmitter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    const event = {
      detail: 'foo',
    }

    eventEmitter.on('fake', mockFn)
    eventEmitter.emit('fake', event)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledWith(event)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls the listener more than once.', () => {
    const eventEmitter = new EventEmitter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    const event = {
      detail: 'foo',
    }

    eventEmitter.on('fake', mockFn)
    eventEmitter.emit('fake', event)
    eventEmitter.emit('fake', event)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls the listener only once.', () => {
    const eventEmitter = new EventEmitter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    const event = {
      detail: 'foo',
    }

    eventEmitter.once('fake', mockFn)
    eventEmitter.emit('fake', event)
    eventEmitter.emit('fake', event)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('fails when trying to unregister a callback but no callback was passed.', () => {
    const eventEmitter = new EventEmitter()

    const fn = () => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      eventEmitter.off('fake')
    }

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fn).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('stops calling the listener.', () => {
    const eventEmitter = new EventEmitter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    const event = {
      detail: 'foo',
    }

    eventEmitter.on('fake', mockFn)
    eventEmitter.emit('fake', event)
    eventEmitter.off('fake', mockFn)
    eventEmitter.emit('fake', event)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('fails when trying to unregister a listener that was not registered.', () => {
    const eventEmitter = new EventEmitter()

    const notRegistered = () => {}

    const fn = () => {
      eventEmitter.off('fake', notRegistered)
    }

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fn).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('fails when trying to unregister a listener more than once.', () => {
    const eventEmitter = new EventEmitter()

    const cb = () => {}

    const fn = () => {
      eventEmitter.off('fake', cb)
      eventEmitter.off('fake', cb)
    }

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fn).toThrow()
  })
})
