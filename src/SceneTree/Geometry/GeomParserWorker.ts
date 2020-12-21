import { parseGeomsBinary } from './parseGeomsBinary.js'

self.onmessage = function (event: any) {
  parseGeomsBinary(event.data, (data: any, transferables: any) => {
    self.postMessage(data, transferables)
  })
}
