import { TreeItem } from '../TreeItem'
import { TreeItemParameter } from './TreeItemParameter'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('TreeItemParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const treeItemParameter = new TreeItemParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItemParameter.getValue()).toBeUndefined()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const treeItemParameter = new TreeItemParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItemParameter.getDataType()).toEqual('TreeItem')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const treeItemParameter = new TreeItemParameter()
    const value = new TreeItem('fooItem')
    value.setVisible(false)
    treeItemParameter.setValue(value)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(treeItemParameter.getValue()).toEqual(value)
  })

  /* it('saves to JSON (serialization).', () => {
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
