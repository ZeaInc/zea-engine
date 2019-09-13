self.onmessage = function(event) {
  const geomBuffers = event.data;
  let memSize = this.__buffers.indices.byteLength;
  const transferables = [this.__buffers.indices];
  for (const attrName in this.__buffers.attrBuffers) {
    const attrData = this.__buffers.attrBuffers[attrName];
    memSize += attrData.values.byteLength;
  }
  console.log('Freeing:' + memSize);
};
