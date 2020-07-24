import { TreeItem } from './TreeItem'

describe('TreeItem', () => {
  it('is visible by default.', () => {
    const treeItem = new TreeItem('Foo')

    expect(treeItem.isVisible()).toBe(true)
  })

  test('Changing visibility.', () => {
    const treeItem = new TreeItem('Foo')

    treeItem.setVisible(false)

    expect(treeItem.isVisible()).toBe(false)
  })

  it("doesn't have children by default.", () => {
    const parent = new TreeItem('Parent')

    expect(parent.getNumChildren()).toBe(0)
  })

  test('Getting child by index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    const index = parent.getChildIndex(child)

    expect(parent.getChild(index)).toBe(child)
  })

  test('Getting child by name.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    expect(parent.getChildByName('Child')).toBe(child)
  })

  test('Counting children.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    expect(parent.getNumChildren()).toBe(1)
  })

  test('Getting children names.', () => {
    const parent = new TreeItem('Parent')
    const childA = new TreeItem('A')
    const childB = new TreeItem('B')

    parent.addChild(childA)
    parent.addChild(childB)

    expect(parent.getChildNames()).toEqual(['A', 'B'])
  })

  test('Getting child index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    expect(parent.getChildIndex(child)).toBe(0)
  })

  test('Resolving a shallow path.', () => {
    const childName = 'Child'
    const parent = new TreeItem('Parent')
    const child = new TreeItem(childName)

    parent.addChild(child)

    const path = childName

    expect(parent.resolvePath(path)).toBe(child)
  })

  test('Resolving a deep path.', () => {
    const parent = new TreeItem('Parent')
    const childA = new TreeItem('A')
    const childAA = new TreeItem('AA')

    childA.addChild(childAA)
    parent.addChild(childA)

    const path = 'A/AA'

    expect(parent.resolvePath(path)).toBe(childAA)
  })

  test('Traversing invoking callback.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    const mockFn = jest.fn()

    parent.traverse(mockFn)

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  test('Removing child by index.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    const index = parent.getChildIndex(child)

    expect(parent.getNumChildren()).toBe(1)

    parent.removeChild(index)

    expect(parent.getNumChildren()).toBe(0)
  })

  test('Removing child by name.', () => {
    const parent = new TreeItem('Parent')
    const childName = 'Child'
    const child = new TreeItem(childName)

    parent.addChild(child)

    expect(parent.getNumChildren()).toBe(1)

    parent.removeChildByName(childName)

    expect(parent.getNumChildren()).toBe(0)
  })

  test('Removing all children.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    expect(parent.getNumChildren()).toBe(1)

    parent.removeAllChildren()

    expect(parent.getNumChildren()).toBe(0)
  })

  test('Setting owner.', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    child.setOwner(parent)

    expect(child.getOwner()).toBe(parent)
  })

  test('Saving to JSON (serialization).', () => {
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    const expOutput = '{"x":1,"y":2,"z":3}'

    // console.log(parent.toJSON())
  })
})
