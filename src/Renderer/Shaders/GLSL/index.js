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

shaderLibrary.setShaderSnippet('testSnippet/snippet2.glsl', snip2)
shaderLibrary.setShaderSnippet('testSnippet/snippet.glsl', snip)
shaderLibrary.setShaderSnippet('testSnippet/rsnip.glsl', rsnip)

shaderLibrary.setShaderSnippet('GLSLBinReader.glsl', GLSLBinReader)
shaderLibrary.setShaderSnippet('computeViewNormal.glsl', computeViewNormal)
shaderLibrary.setShaderSnippet('calcFatLinesViewPos.glsl', calcFatLinesViewPos)
shaderLibrary.setShaderSnippet('math/constants.glsl', constants)
shaderLibrary.setShaderSnippet('convolve-helpers.glsl', convolveHelpers)
shaderLibrary.setShaderSnippet('cutaways.glsl', cutaways)
shaderLibrary.setShaderSnippet('debugColors.glsl', debugColors)
shaderLibrary.setShaderSnippet('drawItemId.glsl', drawItemId)
shaderLibrary.setShaderSnippet('drawItemTexture.glsl', drawItemTexture)
shaderLibrary.setShaderSnippet('pragmatic-pbr/envmap-dualfisheye.glsl', envmapDualfisheye)
shaderLibrary.setShaderSnippet('pragmatic-pbr/envmap-equirect.glsl', envmapEquirect)
shaderLibrary.setShaderSnippet('envmap-octahedral.glsl', envmapOctahedral)
shaderLibrary.setShaderSnippet('GLSLBits.glsl', GLSLBits)
shaderLibrary.setShaderSnippet('GLSLUtils.glsl', GLSLUtils)
shaderLibrary.setShaderSnippet('glslxfo.glsl', glslxfo)
shaderLibrary.setShaderSnippet('Hammersley.glsl', Hammersley)
shaderLibrary.setShaderSnippet('utils/imageAtlas.glsl', imageAtlas)
shaderLibrary.setShaderSnippet('imagePyramid.glsl', imagePyramid)
shaderLibrary.setShaderSnippet('ImageStream.glsl', ImageStream)
shaderLibrary.setShaderSnippet('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
shaderLibrary.setShaderSnippet('materialparams.glsl', materialparams)
shaderLibrary.setShaderSnippet('modelMatrix.glsl', modelMatrix)
shaderLibrary.setShaderSnippet('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
shaderLibrary.setShaderSnippet('SHCoeffs.glsl', SHCoeffs)
shaderLibrary.setShaderSnippet('mattdesl/fxaa-apply.glsl', fxaaApply)
shaderLibrary.setShaderSnippet('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)
shaderLibrary.setShaderSnippet('mattdesl/fxaa.glsl', fxaa)
shaderLibrary.setShaderSnippet('pragmatic-pbr/exposure.glsl', exposure)
shaderLibrary.setShaderSnippet('pragmatic-pbr/sky.glsl', sky)
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-filmic.glsl', tonemapFilmic)
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-reinhard.glsl', tonemapReinhard)
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-uncharted2.glsl', tonemapUncharted2)
shaderLibrary.setShaderSnippet('stack-gl/diffuse-lambert.glsl', diffuseLambert)
shaderLibrary.setShaderSnippet('stack-gl/gamma.glsl', gamma)
shaderLibrary.setShaderSnippet('stack-gl/inverse.glsl', inverse)
shaderLibrary.setShaderSnippet('stack-gl/transpose.glsl', transpose)
shaderLibrary.setShaderSnippet('utils/quadVertexFromID.glsl', quadVertexFromID)
shaderLibrary.setShaderSnippet('utils/unpackHDR.glsl', unpackHDR)
shaderLibrary.setShaderSnippet('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
shaderLibrary.setShaderSnippet('zz85/skyFragment.glsl', skyFragment)
