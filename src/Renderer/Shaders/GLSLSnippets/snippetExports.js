/* eslint-disable require-jsdoc */
class SnippetsLbrary {
  constructor() {
    this._lib = {}
  }

  addFile(name, file) {
    this._lib[name] = file
  }
}

const lib = new SnippetsLbrary()

import snip2 from './testSnippet/snippet2.glsl' // where to find the file
import snip from './testSnippet/snippet.glsl' // where to find the file
import rsnip from './testSnippet/rsnip.glsl' // where to find the file
import computeViewNormal from './computeViewNormal.glsl'
import calcFatLinesViewPos from './calcFatLinesViewPos.glsl'
import constants from './math/constants.glsl'
import convolveHelpers from './convolve-helpers.glsl'
import cutaways from './cutaways.glsl'
import debugColors from './debugColors.glsl'
import drawItemId from './drawItemId.glsl'
import drawItemTexture from './drawItemTexture.glsl'
import envmapDualfisheye from './envmap-dualfisheye.glsl'
import envmapEquirect from './envmap-equirect.glsl'
import envmapOctahedral from './envmap-octahedral.glsl'
import GLSLBits from './GLSLBits.glsl'
import GLSLUtils from './GLSLUtils.glsl'
import glslxfo from './glslxfo.glsl'
import Hammersley from './Hammersley.glsl'
import imageAtlas from './utils/imageAtlas.glsl'
import imagePyramid from './imagePyramid.glsl'
import ImageStream from './ImageStream.glsl'
import ImportanceSampleGGX from './ImportanceSampleGGX.glsl'
import materialparams from './materialparams.glsl'
import modelMatrix from './modelMatrix.glsl'
import PBRSurfaceRadiance from './PBRSurfaceRadiance.glsl'
import SHCoeffs from './SHCoeffs.glsl'
import fxaaApply from './mattdesl/fxaa-apply.glsl'
import fxaaTexcoords from './mattdesl/fxaa-texcoords.glsl'
import fxaa from './mattdesl/fxaa.glsl'
import exposure from './pragmatic-pbr/exposure.glsl'
import sky from './pragmatic-pbr/sky.glsl'
import tonemapFilmic from './pragmatic-pbr/tonemap-filmic.glsl'
import tonemapReinhard from './pragmatic-pbr/tonemap-reinhard.glsl'
import tonemapUncharted2 from './pragmatic-pbr/tonemap-uncharted2.glsl'
import diffuseLambert from './stack-gl/diffuse-lambert.glsl'
import gamma from './stack-gl/gamma.glsl'
import inverse from './stack-gl/inverse.glsl'
import transpose from './stack-gl/transpose.glsl'
import quadVertexFromID from './utils/quadVertexFromID.glsl'
import unpackHDR from './utils/unpackHDR.glsl'
import glslAtmosphere from './wwwtyro/glsl-atmosphere.glsl'
import skyFragment from './zz85/skyFragment.glsl'

lib.addFile('testSnippet/snippet2.glsl', snip2) // name of import used in glsl
lib.addFile('testSnippet/snippet.glsl', snip) // name of import used in glsl
lib.addFile('testSnippet/rsnip.glsl', rsnip) // name of import used in glsl
lib.addFile('computeViewNormal.glsl', computeViewNormal)
lib.addFile('calcFatLinesViewPos.glsl', calcFatLinesViewPos)
lib.addFile('math/constants.glsl', constants)
lib.addFile('convolve-helpers.glsl', convolveHelpers)
lib.addFile('cutaways.glsl', cutaways)
lib.addFile('debugColors.glsl', debugColors)
lib.addFile('drawItemId.glsl', drawItemId)
lib.addFile('drawItemTexture.glsl', drawItemTexture)
lib.addFile('envmap-dualfisheye.glsl', envmapDualfisheye)
lib.addFile('envmap-equirect.glsl', envmapEquirect)
lib.addFile('envmap-octahedral.glsl', envmapOctahedral)
lib.addFile('GLSLBits.glsl', GLSLBits)
lib.addFile('GLSLUtils.glsl', GLSLUtils)
lib.addFile('glslxfo.glsl', glslxfo)
lib.addFile('Hammersley.glsl', Hammersley)
lib.addFile('utils/imageAtlas.glsl', imageAtlas)
lib.addFile('imagePyramid.glsl', imagePyramid)
lib.addFile('ImageStream.glsl', ImageStream)
lib.addFile('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
lib.addFile('materialparams.glsl', materialparams)
lib.addFile('modelMatrix.glsl', modelMatrix)
lib.addFile('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
lib.addFile('SHCoeffs.glsl', SHCoeffs)
lib.addFile('mattdesl/fxaa-apply.glsl', fxaaApply)
lib.addFile('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)
lib.addFile('mattdesl/fxaa.glsl', fxaa)
lib.addFile('pragmatic-pbr/exposure.glsl', exposure)
lib.addFile('pragmatic-pbr/sky.glsl', sky)
lib.addFile('pragmatic-pbr/tonemap-filmic.glsl', tonemapFilmic)
lib.addFile('pragmatic-pbr/tonemap-reinhard.glsl', tonemapReinhard)
lib.addFile('pragmatic-pbr/tonemap-uncharted2.glsl', tonemapUncharted2)
lib.addFile('stack-gl/diffuse-lambert.glsl', diffuseLambert)
lib.addFile('stack-gl/gamma.glsl', gamma)
lib.addFile('stack-gl/inverse.glsl', inverse)
lib.addFile('stack-gl/transpose.glsl', transpose)
lib.addFile('utils/quadVertexFromID.glsl', quadVertexFromID)
lib.addFile('utils/unpackHDR.glsl', unpackHDR)
lib.addFile('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
lib.addFile('zz85/skyFragment.glsl', skyFragment)

export { lib }
