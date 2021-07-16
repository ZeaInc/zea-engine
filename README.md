# Zea Engine

[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]

# Introduction
Zea Engine is a web-based 3D rendering solution designed from the ground up for CAD and professional graphics, which provides the best in class power, speed and reach for the next generation of web applications.

A 3D JavaScript library for innovative manufacturers and industry 4.0 supporters who need to build web applications.

## *Power*
Designed with the highest requirements in mind, giving developers a suite of tools to address the toughest challenges in modern professional graphics app development.  
Zea Engine pushes the limits of what a developer can achieve in the browser by focusing on power and performance.

## *Versatility*
No single solution can solve all problems out of the box. Therefore, the Zea Engine uses a modular architecture that enables developers to integrate new functionalities. Zea keeps the essential features in the core while allowing powerful extensions to be built, either by Zea, to expand the engine's scope, or by third parties who wish to develop specific solutions.

## *Reach*
Applications that leverage the web browser are already available on all modern devices. These web applications provide a friction-free and straightforward way to deliver content without requiring users to install a player. Zea Engine is designed for the web and enables new categories of high performance and versatile web applications.

# Documentation
Full documentation with concepts, tutorials, live examples, API documentation and more; can be found at the zea engine docs site: [https://docs.zea.live/zea-engine/](https://docs.zea.live/zea-engine/)

These docs allow developers to get started with the Zea Engine by downloading free and open-source demo content and using Zea's publicly distributed client-side libraries.

# Add it to your project
The process to add Zea Engine to your projects is very straight forward. 

## *Using CDNs*
For static websites or quick implementation you can always use CDNs like JsDelivr or Unpkg:

### *JsDelivr*
```html
<script crossorigin src="https://cdn.jsdelivr.net/npm/@zeainc/zea-engine/dist/index.umd.min.js"></script>
```
### *Unpkg*
```html
<script crossorigin src="https://unpkg.com/@zeainc/zea-engine/dist/index.umd.js"></script>
```
### *Use it*
```html
<script>
  const { Scene } = globalThis.zeaEngine
</script>
```

# Building

For information on how to build the engine, run the unit tests, and publish release, please consult the [DEVELOPERGUIDE.md](https://github.com/ZeaInc/zea-engine/blob/main/DEVELOPERGUIDE.md).


# Script tags instead of esm imports

Currently the engine and its plugins can only be imported using UMD script tags.

> Why don't we use esm imports to load the engine and its plugins?

Yes we would like to do that eventually, but there are a few issues holding us back.

1. Bundlers like webpack and rollup have a terrible time at understanding diamond shaped dependency trees. I will explain by example. Package B depends on package A and package C depends on both package A and B. If we import B and C, A should be imported. however, if in the package.json of B or C, the version dependency is even slightly different, even with valid version rules that should mean both B and C should be compatible with the same version of A, we find that the bundler will often try to load multiple different versions of A. e.g. A version 2.3.1, and A version 2.3.0. When A is our engine, this causes all sorts of obscure problems. For now, until we can guarantee that the bundler will load exactly one copy of our engine, we have to stick with script tags.

2. Bundlers and WASM don't mix. We leverage WASM in our engine, and WASM requires a fetch of the WASM file which is included in our package. Currently the bundlers are unable to include the WASM file and so we have to fallback to fetching the WASM file from some predefined location, instead of the package location in your node_modules folder. Not ideal, but we hope this issue to be resolved soon as WASM imports are included in the spec.

We hope that these issues are resolved over time. If you have any suggestions on alternative methods to what we have presented, please feel free to reach out and let us know your thoughts.

# Licensing
The Zea Engine is distributed via NPM under the AGPLv3 license which gives developers the rights to evaluate the Zea Engine and build non-commercial applications. By downloading the Zea Engine, your agree to be bound by the terms and conditions of the AGPLv3 license, or the commercial license available on the Zea Website: [_zea.live_](https://www.zea.live/pricing)  
To evaluate the engine with your proprietary content, you will need to access our server-side libraries and a restricted non-commercial evaluation license.

To build a commercial application, you need a commercial licensing agreement.


[npm]: https://badge.fury.io/js/%40zeainc%2Fzea-engine.svg
[npm-url]: https://www.npmjs.com/package/@zeainc/zea-engine
[build-size]: https://badgen.net/bundlephobia/minzip/@zeainc/zea-engine
[build-size-url]: https://bundlephobia.com/result?p=@zeainc/zea-engine
[npm-downloads]: https://img.shields.io/npm/dw/@zeainc/zea-engine
[npmtrends-url]: https://www.npmtrends.com/@zeainc/zea-engine
