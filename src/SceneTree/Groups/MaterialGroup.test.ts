import { MaterialGroup } from './MaterialGroup'
import { TreeItem } from '../TreeItem'
import { Material } from '../Material'
import { GeomItem } from '../GeomItem'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MaterialGroup', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing GeomItem Material by the tree.', () => {
    const group = new MaterialGroup('Foo')
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
})
