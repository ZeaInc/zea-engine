import { TreeItem } from './TreeItem'
import { Vec3, Xfo, Quat } from '../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('TreeItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('is visible by default.', () => {
    const treeItem = new TreeItem('Foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem.isVisible()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing visibility.', () => {
    const treeItem = new TreeItem('Foo')

    treeItem.setVisible(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem.isVisible()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing tree visibility.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    parent.setVisible(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.isVisible()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("doesn't have children by default.", () => {
    const parent = new TreeItem('Parent')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Getting child by index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    const index = parent.getChildIndex(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getChild(index)).toBe(child)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Hierarchical Transformations - Translation.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')
    parent.addChild(child)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    parent.getParameter('LocalXfo').setValue(new Xfo(new Vec3(5, 2, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    child.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      child
        .getParameter('GlobalXfo')
        .getValue()
        .approxEqual(
          {
            ori: { w: 1, x: 0, y: 0, z: 0 },
            tr: { x: 7, y: 6, z: 0 },
          },
          0.001
        )
    ).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Hierarchical Transformations - Rotation.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')
    parent.addChild(child)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    child.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))

    const rotation = new Quat()
    rotation.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    parent.getParameter('LocalXfo').setValue(new Xfo(new Vec3(0, 0, 0), rotation))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      child
        .getParameter('GlobalXfo')
        .getValue()
        .approxEqual({ tr: { x: -4, y: 2, z: 0 }, ori: { x: 0, y: 0, z: 0.70711, w: 0.70711 } }, 0.001)
    ).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Getting child by name.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getChildByName('Child')).toBe(child)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Counting children.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Getting children names.', () => {
    const parent = new TreeItem('Parent')
    const childA = new TreeItem('A')
    const childB = new TreeItem('B')

    parent.addChild(childA)
    parent.addChild(childB)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getChildNames()).toEqual(['A', 'B'])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Getting child index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getChildIndex(child)).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Resolving a shallow path.', () => {
    const childName = 'Child'
    const parent = new TreeItem('Parent')
    const child = new TreeItem(childName)

    parent.addChild(child)

    const path = childName

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.resolvePath(path)).toBe(child)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Resolving a deep path.', () => {
    const parent = new TreeItem('Parent')
    const childA = new TreeItem('A')
    const childAA = new TreeItem('AA')

    childA.addChild(childAA)
    parent.addChild(childA)

    const path = 'A/AA'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.resolvePath(path)).toBe(childAA)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Traversing invoking callback.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()

    parent.traverse(mockFn)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Removing child by index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    const index = parent.getChildIndex(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(1)

    parent.removeChild(index)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Removing child by name.', () => {
    const parent = new TreeItem('Parent')
    const childName = 'Child'
    const child = new TreeItem(childName)

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(1)

    parent.removeChildByName(childName)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Removing all children.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(1)

    parent.removeAllChildren()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parent.getNumChildren()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Setting owner.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    child.setOwner(parent)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.getOwner()).toBe(parent)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Saving to JSON (serialization).', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    const expOutput = '{"x":1,"y":2,"z":3}'

    // console.log(parent.toJSON())
  })
})
