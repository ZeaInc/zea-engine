import { storiesOf } from '@storybook/html'

// eslint-disable-next-line require-jsdoc
function renderIframe(testId) {
  return `<iframe
  src="https://codesandbox.io/embed/${testId}?fontsize=14&hidenavigation=1&theme=light"
  style="width:100%; height:100%; border:0; border-radius: 4px; overflow:hidden;"
  title="compassionate-mountain-n2uln"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  ></iframe>`
}

storiesOf('ZeaEngine/Basic', module).add('Hello World', () => {
  return renderIframe('compassionate-mountain-n2uln')
})
storiesOf('ZeaEngine/Geometry/Points', module).add('2Points', () => {
  return renderIframe('geometry-points-twopoints-s1e0b')
})
storiesOf('ZeaEngine/Geometry/Points', module).add('PointCloud', () => {
  return renderIframe('compassionate-worker-9bcs6')
})
storiesOf('ZeaEngine/Geometry/Lines', module).add('Triangle', () => {
  return renderIframe('charming-paper-021qx')
})
storiesOf('ZeaEngine/Geometry/Lines', module).add('Circle', () => {
  return renderIframe('vigorous-ives-hbncz')
})
storiesOf('ZeaEngine/Geometry/Lines', module).add('FatCircle', () => {
  return renderIframe('dry-night-m1ly3')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('Triangle', () => {
  return renderIframe('musing-bhabha-yplqi')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('ManualQuad', () => {
  return renderIframe('small-leftpad-x41j1')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('Plane', () => {
  return renderIframe('awesome-hooks-uvwzv')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('UVSeam', () => {
  return renderIframe('zeaenginegeometrymeshesuvseam-ryshs')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('UVAndNormalSeam', () => {
  return renderIframe('pensive-haslett-zfb73')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('Cuboid', () => {
  return renderIframe('dreamy-gauss-kdn3s')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('TexturedCuboid', () => {
  return renderIframe('festive-cookies-1tjbg')
})
storiesOf('ZeaEngine/Geometry/Meshes', module).add('GridCloud', () => {
  return renderIframe('friendly-roentgen-mi1qf')
})
storiesOf('ZeaEngine/Geometry', module).add('PrimitiveShapes', () => {
  return renderIframe('aged-sunset-8cm33')
})
storiesOf('ZeaEngine/Geometry', module).add('Billboards', () => {
  return renderIframe('upbeat-cookies-74m5v')
})
storiesOf('ZeaEngine/Geometry', module).add('Grids', () => {
  return renderIframe('jovial-cannon-czx35')
})
storiesOf('ZeaEngine/Geometry', module).add('Labels', () => {
  return renderIframe('ecstatic-almeida-1iqsh')
})
storiesOf('ZeaEngine/Geometry', module).add('HitTesting', () => {
  return renderIframe('heuristic-water-4tkt2')
})
storiesOf('ZeaEngine/Geometry', module).add('Instancing', () => {
  return renderIframe('wizardly-poincare-9koyk')
})
storiesOf('ZeaEngine/Geometry', module).add('Highlights', () => {
  return renderIframe('stupefied-einstein-8u0r')
})
storiesOf('ZeaEngine/MaterialsAndEnvironment', module).add('Materials', () => {
  return renderIframe('vigorous-heisenberg-yfh9l')
})
storiesOf('ZeaEngine/MaterialsAndEnvironment', module).add(
  'LatLongBackgroundLoading',
  () => {
    return renderIframe('angry-resonance-1ipm0')
  }
)
storiesOf('ZeaEngine/MaterialsAndEnvironment', module).add(
  'LatLongSterioBackgroundLoading',
  () => {
    return renderIframe('boring-maxwell-xomli')
  }
)
storiesOf('ZeaEngine/MaterialsAndEnvironment', module).add(
  'LatLongVideoLoading',
  () => {
    return renderIframe('patient-rgb-wgcim')
  }
)
storiesOf('ZeaEngine/MaterialsAndEnvironment', module).add('GifLoading', () => {
  return renderIframe('cool-thunder-3d955')
})
storiesOf('ZeaEngine/DynamicScenes', module).add('Gears', () => {
  return renderIframe('eloquent-wozniak-4yhoz')
})
storiesOf('ZeaEngine/DynamicScenes', module).add('ExplodedParts', () => {
  return renderIframe('hopeful-moon-i8tnd')
})
storiesOf('ZeaEngine/DynamicScenes', module).add(
  'ExplodedParts_Cascade',
  () => {
    return renderIframe('divine-sun-lywm9')
  }
)
storiesOf('ZeaEngine/DynamicScenes', module).add('Cutaway', () => {
  return renderIframe('keen-meadow-txlb0')
})
storiesOf('ZeaEngine/DynamicScenes', module).add('Groups', () => {
  return renderIframe('lingering-sound-pplep')
})
storiesOf('ZeaEngine/System', module).add('AddRemoveItemsFromRenderer', () => {
  return renderIframe('naughty-beaver-nkrrx')
})
storiesOf('ZeaEngine/System/MemoryTest', module).add('SignalsArray', () => {
  return renderIframe('sad-cartwright-wp4bw')
})
storiesOf('ZeaEngine/System/MemoryTest', module).add('XfosArray', () => {
  return renderIframe('priceless-bird-134jr')
})
storiesOf('ZeaEngine/System/MemoryTest', module).add('GeomItemsArray', () => {
  return renderIframe('sharp-fog-2107s')
})
storiesOf('ZeaEngine/System/GPUTest', module).add('1024x99904', () => {
  return renderIframe('admiring-pike-xell3')
})
storiesOf('ZeaEngine/System/GPUTest', module).add('49x1001112', () => {
  return renderIframe('thirsty-bash-hczst')
})
storiesOf('ZeaEngine/System/GPUTest', module).add('484x1001112', () => {
  return renderIframe('suspicious-greider-7xrhp')
})
storiesOf('ZeaEngine/System', module).add('WebVR', () => {
  return renderIframe('vibrant-fermi-zfk30')
})
storiesOf('ZeaEngine/System', module).add('WebVR_HMDs', () => {
  return renderIframe('gifted-heisenberg-8hmjg')
})
storiesOf('ZeaCurves/FlowLines', module).add('NURBSCurve', () => {
  return renderIframe('wonderful-liskov-pbw80')
})
storiesOf('ZeaCurves/FlowLines', module).add('FlowLine', () => {
  return renderIframe('wonderful-sinoussi-suf5l')
})
storiesOf('ZeaCad', module).add('Dead_eye_bearing', () => {
  return renderIframe('pensive-sky-vl3rp')
})
storiesOf('ZeaCad', module).add('Fidget-Spinner', () => {
  return renderIframe('goofy-hill-6dly3')
})
storiesOf('ZeaCad', module).add('ultrasonic-distance-measuring-sensor', () => {
  return renderIframe('amazing-aryabhata-v3hls')
})
storiesOf('ZeaCad', module).add('mordacious', () => {
  return renderIframe('wizardly-framework-c1fld')
})
storiesOf('ZeaCad', module).add('CHASSIS AND POWERPACK', () => {
  return renderIframe('sweet-cray-xr2iv')
})
storiesOf('ZeaCad', module).add('MP4_6 Assembly', () => {
  return renderIframe('throbbing-fog-g4hbw')
})
storiesOf('ZeaCad', module).add('Skywalker VTOL', () => {
  return renderIframe('sparkling-rain-b58dt')
})
