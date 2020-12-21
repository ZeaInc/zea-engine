import { GeometryParameter } from './GeometryParameter'
import { Cylinder } from '../Geometry/Shapes/Cylinder'
import { Cuboid } from '../Geometry/Shapes/Cuboid'
import { GeomItem } from '../../SceneTree/GeomItem'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GeometryParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const geometryParameter = new GeometryParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geometryParameter.getValue()).toBeUndefined()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const geometryParameter = new GeometryParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geometryParameter.getDataType()).toEqual('Geometry')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const geometryParameter = new GeometryParameter()
    const cylinder = new Cylinder(5, 0.2, 32)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Cylinder' is not assignable to p... Remove this comment to see the full error message
    const geomItem = new GeomItem('gear', cylinder)
    geometryParameter.setValue(geomItem)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geometryParameter.getValue()).toEqual(geomItem)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('replaces a value.', () => {
    const geometryParameter = new GeometryParameter('Foo', new Cylinder())

    const cuboid = new Cuboid()
    geometryParameter.setValue(cuboid)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(geometryParameter.getValue()).toEqual(cuboid)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('propagate events.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const geometryParameter = new GeometryParameter('Foo')

    const cuboid = new Cuboid()
    geometryParameter.setValue(cuboid)

    let changed = false
    geometryParameter.on('boundingBoxChanged', () => {
      changed = true
    })

    cuboid.getParameter('X').setValue(3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(changed).toEqual(true)
  })

  /* it('saves to JSON (serialization).', () => {
    const geometryParameter = new GeometryParameter()
    const cylinder = new Cylinder(5, 0.2, 32)
    const geomItem = new GeomItem('gear', cylinder)
    geometryParameter.setValue(geomItem)
    console.log(geometryParameter.toJSON())

    expect(geometryParameter.toJSON()).toEqual(false)
  })

  it('loads from JSON (serialization).', () => {
    const geometryParameter = new GeometryParameter()
    const geometry = { value: { a: 1, b: 0, g: 0, r: 1 } }
    geometryParameter.fromJSON(geometry)

    expect(geometryParameter.getValue()).toEqual(new Geometry(1.0, 0.0, 0.0))
  })*/

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it.skip('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new GeometryParameter('TestParameter')
    const cylinder = new Cylinder(5, 0.2, 32)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Cylinder' is not assignable to p... Remove this comment to see the full error message
    const geomItem = new GeomItem('gear', cylinder)
    parameter.setValue(geomItem)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toBe(parameter2.toJSON())
  })
})
