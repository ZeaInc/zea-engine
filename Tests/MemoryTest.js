

const count = 2000000

testingHarness.registerTest('MemoryTest_SignalsArray', (domElement, resources) => {
  const start = performance.now();
  window.data = [];
  for(let i=0; i<count; i++) {
    window.data.push(new Visualive.Signal());
  }
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_SignalsArray':" + (performance.now() - start)));
  // Results: Chrome spikes to 1.44 Gigs of Ram. Settling down to 1.42 Gigs after a minute.
  // Takes ~660 Ms.
});

testingHarness.registerTest('MemoryTest_XfosArray', (domElement, resources) => {
  const start = performance.now();
  window.data = [];
  for(let i=0; i<count; i++) {
    window.data.push(new Visualive.Xfo(new Visualive.Vec3(i, i * 0.2, i * 0.4)));
  }
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_XfosArray':" + (performance.now() - start)));
  // Results: Chrome spikes to 2.43 Gigs of Ram. Settling down to 2.33Gigs after a minute.
  // Takes ~1915 Ms.
});

testingHarness.registerTest('MemoryTest_Float32Arrays', (domElement, resources) => {
  const start = performance.now();
  window.data = [];
  for(let i=0; i<count; i++) {
    const array = new Float32Array(10);

    // Create a temp Vec3 to wrap the array to set its values.
    const tr = new Visualive.Vec3(array.buffer, 28);
    tr.set(i, i * 0.2, i * 0.4);

    window.data.push(array);
  }
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_Float32Arrays':" + (performance.now() - start)));
  // Results: Chrome spikes to 1.55 Gigs of Ram. Settling down to 1.45 Gigs after a minute.
  // Takes ~2200 Ms.
});



testingHarness.registerTest('MemoryTest_Float32Arrays_ReuseClasses', (domElement, resources) => {
  const start = performance.now();
  window.data = [];
  const tr = new Visualive.Vec3();
  for(let i=0; i<count; i++) {
    const array = new Float32Array(10);

    // Create a temp Vec3 to wrap the array to set its values.
    tr.setDataArray(array);
    tr.set(i, i * 0.2, i * 0.4);

    // const tr = new Float32Array(array.buffer, 28, 3);
    // tr[0] = i; tr[1] = i * 0.2; tr[2] = i * 0.4;
    window.data.push(array);
  }
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_Float32Arrays_ReuseClasses':" + (performance.now() - start)));
  // Results: Chrome spikes to 1.32 Gigs of Ram. Settling down to 1.3Gigs after a minute.
  // Takes ~528 Ms.
});


testingHarness.registerTest('MemoryTest_Float32ArraysContiguous', (domElement, resources) => {
  const start = performance.now();
  window.data = new Float32Array(10 * count);
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_Float32ArraysContiguous':" + (performance.now() - start)));
  // Results: Chrome spikes to 1.09 Gigs of Ram. Settling down to 1.02Gigs after a minute.
  // Takes ~11 Ms.
});

testingHarness.registerTest('MemoryTest_GeomItemsArray', (domElement, resources) => {
  const start = performance.now();
  window.data = [];
  const rootItem = new Visualive.TreeItem();

  const count = 50000
  rootItem.__freeOwnerIndices.push(rootItem.addOwnerIndex(0));
  rootItem.__addPathIndex(0);
  for(let i=0; i<count; i++) {
    rootItem.addChild(new Visualive.GeomItem("Geom"+i))
  }
  document.body.appendChild(document.createTextNode("Done 'MemoryTest_GeomItemsArray':" + (performance.now() - start)));
  // Results: Chrome spikes to 2.34 Gigs of Ram. Settling down to 2.3Gigs after a minute.
  // Takes ~2038 Ms.
});
