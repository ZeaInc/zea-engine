import { RGBA } from './RGBA'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RGBA', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates RGBA from buffer', () => {
    const uInt8Array = Uint8Array.of(255, 20, 150, 1)
    const rgba = RGBA.createFromBuffer(uInt8Array.buffer, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rgba).toEqual(new RGBA(255, 20, 150, 1))
  })
})
