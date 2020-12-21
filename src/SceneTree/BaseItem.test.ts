import { BaseItem } from './BaseItem'
import { TreeItem } from './TreeItem'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BaseItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("doesn't have base items by default.", () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(BaseItem.getNumBaseItems()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Setting owner.', () => {
    const baseItem = new BaseItem('foo')
    const owner = new TreeItem('Owner')
    baseItem.setOwner(owner)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(baseItem.getOwner()).toBe(owner)
  })
})
