import { TreeItem } from '../TreeItem'
import { TreeItemParameter } from './TreeItemParameter'

describe('TreeItemParameter', () => {
  it('has an initial value.', () => {
    const treeItemParameter = new TreeItemParameter()

    expect(treeItemParameter.getValue()).toBeUndefined()
  })

  it('checks value type.', () => {
    const treeItemParameter = new TreeItemParameter()

    expect(treeItemParameter.getDataType()).toEqual('TreeItem')
  })

  it('sets value.', () => {
    const treeItemParameter = new TreeItemParameter()
    const value = new TreeItem('fooItem')
    value.setVisible(false)
    treeItemParameter.setValue(value)

    expect(treeItemParameter.getValue()).toEqual(value)
  })

  /*it('saves to JSON (serialization).', () => {
    const treeItemParameter = new TreeItemParameter()

    const scene = new Scene()
    const value = new TreeItem('fooItem')

    treeItemParameter.setValue(value)

    const expOutput = '{"value":{"x":1,"y":2}}'

    expect(JSON.stringify(treeItemParameter.toJSON(scene))).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const treeItemParameter = new TreeItemParameter()
    const input = { value: { x: 1, y: 2 } }
    treeItemParameter.fromJSON(input)

    expect(treeItemParameter.getValue().toJSON()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const treeItemParameter = new TreeItemParameter()

    const data = Float32Array.of(1, 2)
    const reader = new BinReader(data.buffer)
    treeItemParameter.readBinary(reader)

    expect(treeItemParameter.getValue().toJSON()).toEqual({ x: 1, y: 2})
  })

  it('clones parameter object', () => {
    const parameter = new TreeItemParameter('TestParameter')
    const value = new TreeItem('fooItem')
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })*/
})
