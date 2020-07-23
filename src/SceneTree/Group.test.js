import { Group } from './Group'
import { TreeItem } from './TreeItem'

console.warn = () => {}

describe('Group', () => {
  it('is visible by default.', () => {
    const group = new Group('Foo')

    expect(group.isVisible()).toBe(true)
  })

  test('Changing members visibility.', () => {
    const group = new Group('Foo')
    const treeItem = new TreeItem('TreeItem')

    group.addItem(treeItem)

    expect(group.getParameter('Items').getValue().size).toBe(1)
  })

  test('Adding members using paths.', () => {
    const rootItem = new TreeItem('TreeItem')
    const group = new Group('Foo')
    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    // rootItem.addChild(group)
    group.setSearchRoot(rootItem)
    rootItem.addChild(treeItem1)

    group.setPaths([['.', 'treeItem1', 'treeItem2']])

    expect(group.getParameter('Items').getItem(0)).toBe(treeItem2)
  })

  test('Changing members visibility.', () => {
    const group = new Group('Foo')
    const treeItem = new TreeItem('TreeItem')

    group.addItem(treeItem)

    expect(treeItem.isVisible()).toBe(true)

    group.setVisible(false)

    expect(treeItem.isVisible()).toBe(false)
  })

  test('Changing Tree visibility.', () => {
    const group = new Group('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)
    group.setVisible(false)

    expect(child.isVisible()).toBe(false)
  })

  test('Events propagating from members to the group.', () => {
    const group = new Group('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)

    const mockFn = jest.fn()
    group.on('mouseDown', mockFn)

    const event = {
      detail: 'foo',
      propagating: true,
    }
    child.onMouseDown(event)

    expect(mockFn).toHaveBeenCalledWith(event)
  })

  test('Saving to JSON (serialization).', () => {
    const group = new Group('Foo')

    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    treeItem1.addChild(group)

    group.addItem(treeItem2)

    const expOutput = "{\"params\":{\"LocalXfo\":{\"value\":{\"tr\":{\"x\":0,\"y\":0,\"z\":0},\"ori\":{\"x\":0,\"y\":0,\"z\":0,\"w\":1}}}},\"name\":\"Foo\",\"type\":\"Group\",\"treeItems\":[[\"treeItem1\",\"treeItem2\"]]}"
    expect(JSON.stringify(group.toJSON())).toEqual(expOutput)
  })

  it('load from JSON (serialization).', () => {
    const group = new Group('Foo')

    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    treeItem1.addChild(group)

    const input = {
      params: { LocalXfo: { value: { tr: { x: 0, y: 0, z: 0 }, ori: { x: 0, y: 0, z: 0, w: 1 } } } },
      name: 'Foo',
      type: 'Group',
      treeItems: [['treeItem1', 'treeItem2']],
    }
    group.fromJSON(input, {
      numTreeItems: 0,
      resolvePath: (path, cb) => {
        cb(treeItem1.resolvePath(path))
      },
    })
    expect(group.getParameter('Items').getItem(0)).toBe(treeItem2)
  })
  it('load from JSON (serialization) with no context.', () => {
    const group = new Group('Foo')

    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    treeItem1.addChild(group)

    const input = {
      params: { LocalXfo: { value: { tr: { x: 0, y: 0, z: 0 }, ori: { x: 0, y: 0, z: 0, w: 1 } } } },
      name: 'Foo',
      type: 'Group',
      treeItems: [['treeItem1', 'treeItem2']],
    }

    expect(() => {
      group.fromJSON(input)
    }).toThrow()
  })
})
