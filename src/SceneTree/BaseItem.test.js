import { BaseItem } from './BaseItem'
import { TreeItem } from './TreeItem'

describe('BaseItem', () => {
  it("doesn't have base items by default.", () => {
    expect(BaseItem.getNumBaseItems()).toBe(0)
  })

  test('Setting owner.', () => {
    const baseItem = new BaseItem('foo')
    const owner = new TreeItem('Owner')
    baseItem.setOwner(owner)

    expect(baseItem.getOwner()).toBe(owner)
  })
})
