import { SelectionSet } from './SelectionSet'
import { TreeItem } from '../TreeItem'
import { Color } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SelectionSet', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('is visible by default.', () => {
    const group = new SelectionSet('Foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(group.isVisible()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Changing members visibility.', () => {
    const group = new SelectionSet('Foo')
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
    const group = new SelectionSet('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)
    group.setVisible(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.isVisible()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Adding Highlight to items.', () => {
    const group = new SelectionSet('Foo')
    const parent = new TreeItem('Parent')
    const child = new TreeItem('Child')

    parent.addChild(child)

    group.addItem(parent)
    group.getParameter('Highlighted').setValue(true)
    group.getParameter('HighlightColor').setValue(new Color(1, 0, 0))
    group.getParameter('HighlightFill').setValue(0.5)

    const expHighlight = new Color(1, 0, 0, 0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(child.getHighlight().toString()).toBe(expHighlight.toString())
  })
})
