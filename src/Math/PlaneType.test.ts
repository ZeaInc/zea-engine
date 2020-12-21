import { PlaneType } from './PlaneType'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe.skip('PlaneType', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#on', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('needs a callback.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      const fn = () => {
        eventEmitter.on('fake')
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fn).to.throw()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("doesn't allow duplication.", () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake = sinon.fake()

      const fn = () => {
        eventEmitter.on('fake', fake)
        eventEmitter.on('fake', fake)
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fn).to.throw()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls the listener.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake = sinon.fake()

      const event = {
        detail: 'foo',
      }

      eventEmitter.on('fake', fake)
      eventEmitter.emit('fake', event)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fake).to.have.been.calledWith(event)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls the listener multiple times.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake = sinon.fake()

      const event = {
        detail: 'foo',
      }

      eventEmitter.on('fake', fake)
      eventEmitter.emit('fake', event)
      eventEmitter.emit('fake', event)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fake).to.have.been.calledWith(event)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#once', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls the listener only once.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake = sinon.fake()

      const event = {
        detail: 'foo',
      }

      eventEmitter.once('fake', fake)
      eventEmitter.emit('fake', event)
      eventEmitter.emit('fake', event)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fake).to.have.been.calledOnceWith(event)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#off', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('needs a callback', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      const fn = () => {
        eventEmitter.off('fake')
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fn).to.throw()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('stops calling the listener.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake = sinon.fake()

      const event = {
        detail: 'foo',
      }

      eventEmitter.on('fake', fake)
      eventEmitter.emit('fake', event)
      eventEmitter.off('fake', fake)
      eventEmitter.emit('fake', event)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fake).to.have.been.calledOnceWith(event)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('fails when trying to unregister a listener that was not registered.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      const notRegistered = () => {}

      const fn = () => {
        eventEmitter.off('fake', notRegistered)
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fn).to.throw()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('fails when trying to unregister a listener more than once.', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventEmitter'.
      const eventEmitter = new EventEmitter()

      const cb = () => {}

      const fn = () => {
        eventEmitter.off('fake', cb)
        eventEmitter.off('fake', cb)
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(fn).to.throw()
    })
  })
})
