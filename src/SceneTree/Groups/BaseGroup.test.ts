import { BaseGroup } from './BaseGroup'
import { TreeItem } from '../TreeItem'
import { Material } from '../Material'
import { GeomItem } from '../GeomItem'
import { Vec3, Xfo } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BaseGroup', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('is visible by default.', () => {
    const baseGroup = new BaseGroup('Foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(baseGroup.isVisible()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Adding members.', () => {
    const group = new BaseGroup('Foo')
    const treeItem = new TreeItem('TreeItem')

    group.addItem(treeItem)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('Items').getValue().size).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Adding members using paths.', () => {
    const rootItem = new TreeItem('TreeItem')
    const group = new BaseGroup('Foo')
    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    // rootItem.addChild(group)
    group.setSearchRoot(rootItem)
    rootItem.addChild(treeItem1)

    group.setPaths([['.', 'treeItem1', 'treeItem2']])

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('Items').getItem(0)).toBe(treeItem2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Events propagating from members to the group.', () => {
    const group = new BaseGroup('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()
    group.on('pointerDown', mockFn)

    const event = {
      detail: 'foo',
      propagating: true,
    }
    child.onPointerDown(event)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledWith(event)
  })
})
