// import { TreeItem } from '../TreeItem'
import { TreeItemParameter } from './TreeItemParameter'
//import { BinReader } from '../BinReader'

describe('TreeItemParameter', () => {
  it.skip('has an initial value.', () => {
    const treeItemParameter = new TreeItemParameter()

    expect(treeItemParameter.getValue()).isEqual('')
  })

  it('checks value type.', () => {
    const treeItemParameter = new TreeItemParameter()

    expect(treeItemParameter.getDataType()).toEqual('TreeItem')
  })

  /*it('sets value.', () => {
    const treeItemParameter = new TreeItemParameter()
    const value = new TreeItem()
    treeItemParameter.setValue(value)
    expect(treeItemParameter.getValue()).toEqual(value)
  })

  it('saves to JSON (serialization).', () => {
    const treeItemParameter = new TreeItemParameter()
    const value = new TreeItem(1, 2)
    treeItemParameter.setValue(value)

    const expOutput = '{"value":{"x":1,"y":2}}'

    expect(JSON.stringify(treeItemParameter.toJSON())).toEqual(expOutput)
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
    const value = new TreeItem(1, 2)
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })*/
})
