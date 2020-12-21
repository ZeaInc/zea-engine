import { Group } from './Group'
import { TreeItem } from '../TreeItem'
import { Material } from '../Material'
import { GeomItem } from '../GeomItem'
import { Vec3, Xfo } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Group', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('is visible by default.', () => {
    const group = new Group('Foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.isVisible()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing members visibility.', () => {
    const group = new Group('Foo')
    const treeItem = new TreeItem('TreeItem')

    group.addItem(treeItem)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('Items').getValue().size).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('Items').getItem(0)).toBe(treeItem2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing members visibility.', () => {
    const group = new Group('Foo')
    const treeItem = new TreeItem('TreeItem')

    group.addItem(treeItem)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem.isVisible()).toBe(true)

    group.setVisible(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem.isVisible()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing Tree visibility.', () => {
    const group = new Group('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)
    group.setVisible(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.isVisible()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing GeomItem Material by the tree.', () => {
    const group = new Group('Foo')
    const parent = new TreeItem('Parent')
    const geomItem = new GeomItem('Child')

    parent.addChild(geomItem)

    group.addItem(parent)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const material = new Material('MyMaterial')
    group.getParameter('Material').setValue(material)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geomItem.getParameter('Material').getValue()).toBe(material)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Events propagating from members to the group.', () => {
    const group = new Group('Foo')
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Calculating the Group Xfo using different INITIAL_XFO_MODES.', () => {
    const group = new Group('Foo')
    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    const treeItem3 = new TreeItem('treeItem3')
    const treeItem4 = new TreeItem('treeItem4')
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem1.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem2.getParameter('LocalXfo').setValue(new Xfo(new Vec3(4, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem3.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 2, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem4.getParameter('LocalXfo').setValue(new Xfo(new Vec3(4, 2, 0)))

    group.addItem(treeItem1)
    group.addItem(treeItem2)
    group.addItem(treeItem3)
    group.addItem(treeItem4)
    group.getParameter('InitialXfoMode').setValue(Group.INITIAL_XFO_MODES.average)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('GlobalXfo').getValue().toJSON()).toStrictEqual({
      tr: { x: 3, y: 3, z: 0 },
      ori: { w: 1, x: 0, y: 0, z: 0 },
    })

    group.getParameter('InitialXfoMode').setValue(Group.INITIAL_XFO_MODES.first)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.getParameter('GlobalXfo').getValue().toJSON()).toStrictEqual({
      tr: { x: 2, y: 4, z: 0 },
      ori: { w: 1, x: 0, y: 0, z: 0 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing Group Xfo to move its items.', () => {
    const group = new Group('Foo')
    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    const treeItem3 = new TreeItem('treeItem3')
    const treeItem4 = new TreeItem('treeItem4')
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem1.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem2.getParameter('LocalXfo').setValue(new Xfo(new Vec3(4, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem3.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 2, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    treeItem4.getParameter('LocalXfo').setValue(new Xfo(new Vec3(4, 2, 0)))

    group.addItem(treeItem1)
    group.addItem(treeItem2)
    group.addItem(treeItem3)
    group.addItem(treeItem4)

    // Move and rotate the group by _modifying_ its global Xfo.
    const xfo = group.getParameter('GlobalXfo').getValue()
    xfo.tr.x += 10
    xfo.tr.y += 10
    xfo.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)
    group.getParameter('GlobalXfo').setValue(xfo)

    // Now the group is rotated around its new center.
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem1.getParameter('GlobalXfo').getValue().tr.toJSON()).toStrictEqual({ x: 12, y: 12, z: 0 })
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem2.getParameter('GlobalXfo').getValue().tr.toJSON()).toStrictEqual({ x: 12, y: 14, z: 0 })
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem3.getParameter('GlobalXfo').getValue().tr.toJSON()).toStrictEqual({ x: 14, y: 12, z: 0 })
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem4.getParameter('GlobalXfo').getValue().tr.toJSON()).toStrictEqual({ x: 14, y: 14, z: 0 })

    group.getParameter('InitialXfoMode').setValue(Group.INITIAL_XFO_MODES.first)
    const xfo2 = group.getParameter('GlobalXfo').getValue()
    xfo2.tr.x += 10
    xfo2.tr.y += 10
    xfo2.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)
    group.getParameter('GlobalXfo').setValue(xfo2)
    // Now the group is rotated around its new center.
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem1.getParameter('GlobalXfo').getValue().tr.approxEqual({ x: 2, y: 24, z: 0 }, 0.001)).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem2.getParameter('GlobalXfo').getValue().tr.approxEqual({ x: 12, y: 16, z: 0 }, 0.001)).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem3.getParameter('GlobalXfo').getValue().tr.approxEqual({ x: 14, y: 14, z: 0 }, 0.001)).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItem4.getParameter('GlobalXfo').getValue().tr.approxEqual({ x: 14, y: 16, z: 0 }, 0.001)).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Saving to JSON (serialization).', () => {
    const group = new Group('Foo')

    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    treeItem1.addChild(group)

    group.addItem(treeItem2)

    const expOutput =
      '{"params":{"Visible":{"value":true},"LocalXfo":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}},"GlobalXfo":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}},"BoundingBox":{"value":{"p0":{"x":null,"y":null,"z":null},"p1":{"x":null,"y":null,"z":null}}},"Items":{},"InitialXfoMode":{"value":3,"range":[0,4],"step":1},"Highlighted":{"value":false},"HighlightColor":{"value":{"r":0.5,"g":0.5,"b":1,"a":1}},"HighlightFill":{"value":0,"range":[0,1]},"CutAwayEnabled":{"value":false},"CutPlaneNormal":{"value":{"x":1,"y":0,"z":0}},"CutPlaneDist":{"value":0},"GroupTransform":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}}},"name":"Foo","type":"Group","treeItems":[["treeItem1","treeItem2"]]}'
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = group.toJSON()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(outputJSON)).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    const group = new Group('Foo')

    const treeItem1 = new TreeItem('treeItem1')
    const treeItem2 = new TreeItem('treeItem2')
    treeItem1.addChild(treeItem2)
    treeItem1.addChild(group)

    const inputStr =
      '{"params":{"Visible":{"value":true},"LocalXfo":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}},"GlobalXfo":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}},"BoundingBox":{"value":{"p0":{"x":null,"y":null,"z":null},"p1":{"x":null,"y":null,"z":null}}},"Items":{},"InitialXfoMode":{"value":3,"range":[0,4],"step":1},"Highlighted":{"value":false},"HighlightColor":{"value":{"r":0.5,"g":0.5,"b":1,"a":1}},"HighlightFill":{"value":0,"range":[0,1]},"CutAwayEnabled":{"value":false},"CutPlaneNormal":{"value":{"x":1,"y":0,"z":0}},"CutPlaneDist":{"value":0},"GroupTransform":{"value":{"tr":{"x":0,"y":0,"z":0},"ori":{"x":0,"y":0,"z":0,"w":1}}}},"name":"Foo","type":"Group","treeItems":[["treeItem1","treeItem2"]]}'
    const input = JSON.parse(inputStr)

    group.fromJSON(input, {
      numTreeItems: 0,
      resolvePath: (path: any, cb: any) => {
        cb(treeItem1.resolvePath(path))
      },
    })
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(group.toJSON())).toEqual(inputStr)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('fails when loading from JSON (serialization) with no context.', () => {
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      group.fromJSON(input)
    }).toThrow()
  })
})
