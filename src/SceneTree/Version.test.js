import { Version } from './Version'

describe('Version', () => {
  test('Check for default version value.', () => {
    const version = new Version()
    expect(version.compare([0, 0, 0])).toBe(0)
  })

  it('Compares an equal version and returns 0', () => {
    const version = new Version('1.5.2')
    expect(version.compare([1, 5, 2])).toBe(0)
  })

  it('Compares with a lower version and returns positive', () => {
    const version = new Version('1.2.2')
    expect(version.compare([1, 1, 0])).toBeGreaterThan(0)
  })

  it('Compares with a higher version and returns negative', () => {
    const version = new Version('1.2.2')
    expect(version.compare([1, 5, 3])).toBeLessThan(0)
  })
})
