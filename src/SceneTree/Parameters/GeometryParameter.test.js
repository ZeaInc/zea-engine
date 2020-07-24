import { GeometryParameter } from './GeometryParameter'
import { Cylinder } from '../Geometry/Shapes/Cylinder'
import { GeomItem } from '../../SceneTree/GeomItem'

describe('GeometryParameter', () => {
  it('has an initial value.', () => {
    const geometryParameter = new GeometryParameter()

    expect(geometryParameter.getValue()).toBeUndefined()
  })

  it('checks value type.', () => {
    const geometryParameter = new GeometryParameter()

    expect(geometryParameter.getDataType()).toEqual('Geometry')
  })

  it('sets value.', () => {
    const geometryParameter = new GeometryParameter()
    const cylinder = new Cylinder(5, 0.2, 32)
    const geomItem = new GeomItem('gear', cylinder)
    geometryParameter.setValue(geomItem)

    expect(geometryParameter.getValue()).toEqual(geomItem)
  })

  /*it('saves to JSON (serialization).', () => {
    const geometryParameter = new GeometryParameter()
    const cylinder = new Cylinder(5, 0.2, 32)
    const geomItem = new GeomItem('gear', cylinder)
    geometryParameter.setValue(geomItem)
    console.log(geometryParameter.toJSON())

    expect(geometryParameter.toJSON()).toEqual({ value: { a: 1, b: 0, g: 0, r: 1 } })
  })

  it('loads from JSON (serialization).', () => {
    const geometryParameter = new GeometryParameter()
    const geometry = { value: { a: 1, b: 0, g: 0, r: 1 } }
    geometryParameter.fromJSON(geometry)

    expect(geometryParameter.getValue()).toEqual(new Geometry(1.0, 0.0, 0.0))
  })*/

  it('clones parameter object', () => {
    const parameter = new GeometryParameter('TestParameter')
    const cylinder = new Cylinder(5, 0.2, 32)
    const geomItem = new GeomItem('gear', cylinder)
    parameter.setValue(geomItem)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
