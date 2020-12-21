import { TreeItem } from './TreeItem'
import { GeomItem } from './GeomItem'
import { Vec3, Xfo, Color, Mat4, Quat } from '../Math'
import { Material } from './Material'
import { Sphere } from './Geometry/Shapes/Sphere'
import '../Renderer/Shaders/SimpleSurfaceShader'
import Fixtures from './_fixtures_/GeomItem.fixture.js'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GeomItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-3 arguments, but got 0.
    const geoItem = new GeomItem()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('Geometry').getValue()).toBeUndefined()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('Material').getValue()).toBeUndefined()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('GeomOffsetXfo').getValue()).toEqual(new Xfo())
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('GeomMat').getValue()).toEqual(new Mat4())
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-3 arguments, but got 0.
    const geoItem = new GeomItem()
    geoItem.getParameter('Geometry').setValue(new Sphere(1.4, 13))
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('Geometry').getValue().toJSON()).toEqual(new Sphere(1.4, 13).toJSON())

    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))
    geoItem.getParameter('Material').setValue(standardMaterial)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('Material').getValue()).toEqual(standardMaterial)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 0, 1, 0), new Vec3(8, 9, 10))
    geoItem.getParameter('GeomOffsetXfo').setValue(xfo)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('GeomOffsetXfo').getValue().toJSON()).toEqual(xfo.toJSON())

    // This is computed, so the returned value is different
    const mat4 = new Mat4(-8, 0, 0, 0, 0, -9, 0, 0, 0, 0, 10, 0, 1, 2, 3, 1)
    geoItem.getParameter('GeomMat').setValue(mat4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geoItem.getParameter('GeomMat').getValue()).toEqual(mat4)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('test GeomOffsetXfo and GeomMat.', () => {
    const parent = new TreeItem('Parent')
    const child = new GeomItem('Child')
    parent.addChild(child)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    parent.getParameter('LocalXfo').setValue(new Xfo(new Vec3(5, 2, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    child.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    child.getParameter('GeomOffsetXfo').setValue(new Xfo(new Vec3(2, 4, 0)))

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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.getParameter('GeomMat').getValue().asArray()).toEqual(
      Float32Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 9, 10, 0, 1)
    )
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Saving to JSON (serialization).', () => {
    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Sphere' is not assignable to par... Remove this comment to see the full error message
    const geomItem = new GeomItem('Item', new Sphere(1.4, 13), standardMaterial)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    geomItem.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    geomItem.getParameter('GeomOffsetXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // To trigger a new calculation of the BBox we need to request its value
    geomItem.getParameter('BoundingBox').getValue()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geomItem.toJSON()).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    const geomItem = new GeomItem('Item')
    geomItem.fromJSON(Fixtures.fromJSON, { numGeomItems: 0 })

    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Sphere' is not assignable to par... Remove this comment to see the full error message
    const defaultItem = new GeomItem('Item', new Sphere(1.4, 13), standardMaterial)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    defaultItem.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    defaultItem.getParameter('GeomOffsetXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // To trigger a new calculation of the BBox we need to request its value
    defaultItem.getParameter('BoundingBox').getValue()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geomItem.toJSON()).toEqual(defaultItem.toJSON())
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones GeomItem', () => {
    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Sphere' is not assignable to par... Remove this comment to see the full error message
    const item = new GeomItem('Item', new Sphere(1.4, 13), standardMaterial)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    item.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    item.getParameter('GeomOffsetXfo').setValue(new Xfo(new Vec3(2, 4, 0)))

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const clonedItem = item.clone()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(item.toJSON()).toEqual(clonedItem.toJSON())
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('copies from another GeomItem', () => {
    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Sphere' is not assignable to par... Remove this comment to see the full error message
    const item = new GeomItem('Item', new Sphere(1.4, 13), standardMaterial)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    item.getParameter('LocalXfo').setValue(new Xfo(new Vec3(2, 4, 0)))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    item.getParameter('GeomOffsetXfo').setValue(new Xfo(new Vec3(2, 4, 0)))

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-3 arguments, but got 0.
    const copiedItem = new GeomItem()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    copiedItem.copyFrom(item)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(item.toJSON()).toEqual(copiedItem.toJSON())
  })
})
