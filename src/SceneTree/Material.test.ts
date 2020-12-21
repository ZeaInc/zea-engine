import { Material } from './Material'
import '../Renderer/Shaders/SimpleSurfaceShader'
import { Color } from '../Math/Color'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Material', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Calling set shaders name', () => {
    const material = new Material('foo', 'SimpleSurfaceShader')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(material.hasParameter('BaseColor')).toBeTruthy()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Saving to JSON (serialization).', () => {
    const material = new Material('myMaterial', 'SimpleSurfaceShader')
    material.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(material.toJSON()).toEqual({
      name: 'myMaterial',
      params: {
        BaseColor: {
          value: {
            a: 1,
            b: 0.3607843220233917,
            g: 0.7137255072593689,
            r: 0.3490196168422699,
          },
        },
        EmissiveStrength: {
          range: [0, 1],
          value: 0,
        },
        Opacity: {
          range: [0, 1],
          value: 1,
        },
      },
      shader: 'SimpleSurfaceShader',
      type: 'Material',
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const material = new Material()
    const inputJSON = {
      name: 'myMaterial',
      params: {
        BaseColor: {
          value: {
            a: 1,
            b: 0.3607843220233917,
            g: 0.7137255072593689,
            r: 0.3490196168422699,
          },
        },
        EmissiveStrength: {
          range: [0, 1],
          value: 0,
        },
        Opacity: {
          range: [0, 1],
          value: 1,
        },
      },
      shader: 'SimpleSurfaceShader',
      type: 'Material',
    }
    material.fromJSON(inputJSON)

    const standardMaterial = new Material('myMaterial', 'SimpleSurfaceShader')
    standardMaterial.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(material.toJSON()).toEqual(standardMaterial.toJSON())
  })
})
