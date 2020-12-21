import { Mat3 } from './Mat3'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Mat3', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates Mat3 from buffer', () => {
    const float32Array = Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
    const mat3 = Mat3.createFromBuffer(float32Array.buffer, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3).toEqual(new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9))
  })
})
