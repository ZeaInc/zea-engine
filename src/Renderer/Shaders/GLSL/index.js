import { shaderLibrary } from '../../ShaderLibrary.js'

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
import envmapDualfisheye from './pragmatic-pbr/envmap-dualfisheye.glsl'
import envmapEquirect from './pragmatic-pbr/envmap-equirect.glsl'
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
import GLSLBinReader from './GLSLBinReader.glsl'

shaderLibrary.setShaderModule('testSnippet/snippet2.glsl', snip2)
shaderLibrary.setShaderModule('testSnippet/snippet.glsl', snip)
shaderLibrary.setShaderModule('testSnippet/rsnip.glsl', rsnip)

shaderLibrary.setShaderModule('GLSLBinReader.glsl', GLSLBinReader)
shaderLibrary.setShaderModule('computeViewNormal.glsl', computeViewNormal)
shaderLibrary.setShaderModule('calcFatLinesViewPos.glsl', calcFatLinesViewPos)
shaderLibrary.setShaderModule('math/constants.glsl', constants)
shaderLibrary.setShaderModule('convolve-helpers.glsl', convolveHelpers)
shaderLibrary.setShaderModule('cutaways.glsl', cutaways)
shaderLibrary.setShaderModule('debugColors.glsl', debugColors)
shaderLibrary.setShaderModule('drawItemId.glsl', drawItemId)
shaderLibrary.setShaderModule('drawItemTexture.glsl', drawItemTexture)
shaderLibrary.setShaderModule('pragmatic-pbr/envmap-dualfisheye.glsl', envmapDualfisheye)
shaderLibrary.setShaderModule('pragmatic-pbr/envmap-equirect.glsl', envmapEquirect)
shaderLibrary.setShaderModule('envmap-octahedral.glsl', envmapOctahedral)
shaderLibrary.setShaderModule('GLSLBits.glsl', GLSLBits)
shaderLibrary.setShaderModule('GLSLUtils.glsl', GLSLUtils)
shaderLibrary.setShaderModule('glslxfo.glsl', glslxfo)
shaderLibrary.setShaderModule('Hammersley.glsl', Hammersley)
shaderLibrary.setShaderModule('utils/imageAtlas.glsl', imageAtlas)
shaderLibrary.setShaderModule('imagePyramid.glsl', imagePyramid)
shaderLibrary.setShaderModule('ImageStream.glsl', ImageStream)
shaderLibrary.setShaderModule('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
shaderLibrary.setShaderModule('materialparams.glsl', materialparams)
shaderLibrary.setShaderModule('modelMatrix.glsl', modelMatrix)
shaderLibrary.setShaderModule('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
shaderLibrary.setShaderModule('SHCoeffs.glsl', SHCoeffs)
shaderLibrary.setShaderModule('mattdesl/fxaa-apply.glsl', fxaaApply)
shaderLibrary.setShaderModule('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)
shaderLibrary.setShaderModule('mattdesl/fxaa.glsl', fxaa)
shaderLibrary.setShaderModule('pragmatic-pbr/exposure.glsl', exposure)
shaderLibrary.setShaderModule('pragmatic-pbr/sky.glsl', sky)
shaderLibrary.setShaderModule('pragmatic-pbr/tonemap-filmic.glsl', tonemapFilmic)
shaderLibrary.setShaderModule('pragmatic-pbr/tonemap-reinhard.glsl', tonemapReinhard)
shaderLibrary.setShaderModule('pragmatic-pbr/tonemap-uncharted2.glsl', tonemapUncharted2)
shaderLibrary.setShaderModule('stack-gl/diffuse-lambert.glsl', diffuseLambert)
shaderLibrary.setShaderModule('stack-gl/gamma.glsl', gamma)
shaderLibrary.setShaderModule('stack-gl/inverse.glsl', inverse)
shaderLibrary.setShaderModule('stack-gl/transpose.glsl', transpose)
shaderLibrary.setShaderModule('utils/quadVertexFromID.glsl', quadVertexFromID)
shaderLibrary.setShaderModule('utils/unpackHDR.glsl', unpackHDR)
shaderLibrary.setShaderModule('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
shaderLibrary.setShaderModule('zz85/skyFragment.glsl', skyFragment)
