import { Material } from './Material'
import '../Renderer/Shaders/SimpleSurfaceShader'
import { Color } from '../Math/Color'

describe('Material', () => {
  it('Calling set shaders name', () => {
    const material = new Material('foo', 'SimpleSurfaceShader')
    expect(material.hasParameter('BaseColor')).toBeTruthy()
  })

  test('Saving to JSON (serialization).', () => {
    const material = new Material('myMaterial', 'SimpleSurfaceShader')
    material.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))

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
        Opacity: {
          range: [0, 1],
          value: 1,
        },
      },
      shader: 'SimpleSurfaceShader',
      type: 'Material',
    })
  })

  it('loads from JSON (serialization).', () => {
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

    expect(material.toJSON()).toEqual(standardMaterial.toJSON())
  })
})
