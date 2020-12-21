import { Version } from './Version'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Version', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for default version value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const version = new Version()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(version.compare([0, 0, 0])).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Compares an equal version and returns 0', () => {
    const version = new Version('1.5.2')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(version.compare([1, 5, 2])).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Compares with a lower version and returns positive', () => {
    const version = new Version('1.2.2')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(version.compare([1, 1, 0])).toBeGreaterThan(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Compares with a higher version and returns negative', () => {
    const version = new Version('1.2.2')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(version.compare([1, 5, 3])).toBeLessThan(0)
  })
})
