import { parseGeomsBinary } from './parseGeomsBinary.js';

self.onmessage = function(event) {
  parseGeomsBinary(event.data, (data, transferables) => {
    self.postMessage(data, transferables);
  });
};
