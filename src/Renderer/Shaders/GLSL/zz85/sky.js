/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 */
import skyVertex from './snippets/skyVertex.glsl'
import skyFragment from './snippets/skyFragment.glsl'
shaderLibrary.setShaderModule('zz85/skyVertex.glsl', skyVertex)

shaderLibrary.setShaderModule('zz85/skyFragment.glsl', skyFragment)
