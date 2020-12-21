import { Quat } from './Quat'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Quat', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates Quat from buffer', () => {
    const float32Array = Float32Array.of(1, 0, 0, 0)
    const quat = Quat.createFromBuffer(float32Array.buffer, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quat).toEqual(new Quat(1, 0, 0, 0))
  })
})
