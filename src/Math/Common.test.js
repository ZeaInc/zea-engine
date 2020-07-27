import { common } from './Common'

describe.skip('common', () => {
  test('#clamp', () => {
    const val = common.clamp(3, 1, 5)
    expect(val).toBe(3)
  })

  test('#lerp', () => {
    const val = common.lerp(1, 2, 3)
    expect(val).toBe(4)
  })

  test('#randomInt', () => {
    const val = common.randomInt(1, 1)
    expect(val).toBe(1)
  })
})
