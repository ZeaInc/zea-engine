import { MaterialGroup } from './MaterialGroup'
import { TreeItem } from '../TreeItem'
import { Material } from '../Material'
import { GeomItem } from '../GeomItem'

describe('MaterialGroup', () => {
  test('Changing GeomItem Material by the tree.', () => {
    const group = new MaterialGroup('Foo')
    const parent = new TreeItem('Parent')
    const geomItem = new GeomItem('Child')

    parent.addChild(geomItem)

    group.addItem(parent)

    const material = new Material('MyMaterial')
    group.getParameter('Material').setValue(material)

    expect(geomItem.getParameter('Material').getValue()).toBe(material)
  })
})
