export default {
  fromJSON: {
    name: 'Item',
    params: {
      BoundingBox: {
        value: {
          p0: {
            x: 2.65059232711792,
            y: 6.620340824127197,
            z: -1.399999976158142,
          },
          p1: {
            x: 5.389792442321777,
            y: 9.379659652709961,
            z: 1.399999976158142,
          },
        },
      },
      GeomMat: {
        value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 8, 0, 1],
      },
      GeomOffsetXfo: {
        value: {
          ori: {
            w: 1,
            x: 0,
            y: 0,
            z: 0,
          },
          tr: {
            x: 2,
            y: 4,
            z: 0,
          },
        },
      },
      Geometry: {
        value: {
          params: {
            Loops: {
              range: [3, 200],
              step: 1,
              value: 12,
            },
            Radius: {
              value: 1.4,
            },
            Sides: {
              range: [3, 200],
              step: 1,
              value: 13,
            },
          },
          type: 'Sphere',
          vertexAttributes: {},
        },
      },
      GlobalXfo: {
        value: {
          ori: {
            w: 1,
            x: 0,
            y: 0,
            z: 0,
          },
          tr: {
            x: 2,
            y: 4,
            z: 0,
          },
        },
      },
      LocalXfo: {
        value: {
          ori: {
            w: 1,
            x: 0,
            y: 0,
            z: 0,
          },
          tr: {
            x: 2,
            y: 4,
            z: 0,
          },
        },
      },
      Material: {
        value: {
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
        },
      },
      Visible: {
        value: true,
      },
    },
    type: 'GeomItem',
  },
}
