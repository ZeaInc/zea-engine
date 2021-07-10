import { shaderLibrary } from '../../ShaderLibrary.js'

import snip2 from './testSnippet/snippet2.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/snippet2.glsl', snip2) // name of import used in glsl
import snip from './testSnippet/snippet.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/snippet.glsl', snip) // name of import used in glsl

import rsnip from './testSnippet/rsnip.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/rsnip.glsl', rsnip) // name of import used in glsl

import computeViewNormal from './computeViewNormal.glsl'
shaderLibrary.setShaderSnippet('computeViewNormal.glsl', computeViewNormal)

import calcFatLinesViewPos from './calcFatLinesViewPos.glsl'
shaderLibrary.setShaderSnippet('calcFatLinesViewPos.glsl', calcFatLinesViewPos)

import constants from './math/constants.glsl'
shaderLibrary.setShaderSnippet('math/constants.glsl', constants)
import convolveHelpers from './convolve-helpers.glsl'
shaderLibrary.setShaderSnippet('convolve-helpers.glsl', convolveHelpers)
import cutaways from './cutaways.glsl'
shaderLibrary.setShaderSnippet('cutaways.glsl', cutaways)
import debugColors from './debugColors.glsl'
shaderLibrary.setShaderSnippet('debugColors.glsl', debugColors)
import drawItemId from './drawItemId.glsl'
shaderLibrary.setShaderSnippet('drawItemId.glsl', drawItemId)
import drawItemTexture from './drawItemTexture.glsl'
shaderLibrary.setShaderSnippet('drawItemTexture.glsl', drawItemTexture)
import envmapDualfisheye from './envmap-dualfisheye.glsl'
shaderLibrary.setShaderSnippet('envmap-dualfisheye.glsl', envmapDualfisheye)
import envmapEquirect from './envmap-equirect.glsl'
shaderLibrary.setShaderSnippet('envmap-equirect.glsl', envmapEquirect)
import envmapOctahedral from './envmap-octahedral.glsl'
shaderLibrary.setShaderSnippet('envmap-octahedral.glsl', envmapOctahedral)
import GLSLBits from './GLSLBits.glsl'
shaderLibrary.setShaderSnippet('GLSLBits.glsl', GLSLBits)
import GLSLUtils from './GLSLUtils.glsl'
shaderLibrary.setShaderSnippet('GLSLUtils.glsl', GLSLUtils)
import glslxfo from './glslxfo.glsl'
shaderLibrary.setShaderSnippet('glslxfo.glsl', glslxfo)
import Hammersley from './Hammersley.glsl'
shaderLibrary.setShaderSnippet('Hammersley.glsl', Hammersley)
import imageAtlas from './utils/imageAtlas.glsl'
shaderLibrary.setShaderSnippet('utils/imageAtlas.glsl', imageAtlas)
import imagePyramid from './imagePyramid.glsl'
shaderLibrary.setShaderSnippet('imagePyramid.glsl', imagePyramid)
import ImageStream from './ImageStream.glsl'
shaderLibrary.setShaderSnippet('ImageStream.glsl', ImageStream)
import ImportanceSampleGGX from './ImportanceSampleGGX.glsl'
shaderLibrary.setShaderSnippet('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
import materialparams from './materialparams.glsl'
shaderLibrary.setShaderSnippet('materialparams.glsl', materialparams)
import modelMatrix from './modelMatrix.glsl'
shaderLibrary.setShaderSnippet('modelMatrix.glsl', modelMatrix)
import PBRSurfaceRadiance from './PBRSurfaceRadiance.glsl'
shaderLibrary.setShaderSnippet('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
import SHCoeffs from './SHCoeffs.glsl'
shaderLibrary.setShaderSnippet('SHCoeffs.glsl', SHCoeffs)
import fxaaApply from './mattdesl/fxaa-apply.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa-apply.glsl', fxaaApply)
import fxaaTexcoords from './mattdesl/fxaa-texcoords.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)
import fxaa from './mattdesl/fxaa.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa.glsl', fxaa)
import exposure from './pragmatic-pbr/exposure.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/exposure.glsl', exposure)
import sky from './pragmatic-pbr/sky.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/sky.glsl', sky)
import tonemapFilmic from './pragmatic-pbr/tonemap-filmic.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-filmic.glsl', tonemapFilmic)
import tonemapReinhard from './pragmatic-pbr/tonemap-reinhard.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-reinhard.glsl', tonemapReinhard)
import tonemapUncharted2 from './pragmatic-pbr/tonemap-uncharted2.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-uncharted2.glsl', tonemapUncharted2)
import diffuseLambert from './stack-gl/diffuse-lambert.glsl'
shaderLibrary.setShaderSnippet('stack-gl/diffuse-lambert.glsl', diffuseLambert)
import gamma from './stack-gl/gamma.glsl'
shaderLibrary.setShaderSnippet('stack-gl/gamma.glsl', gamma)
import inverse from './stack-gl/inverse.glsl'
shaderLibrary.setShaderSnippet('stack-gl/inverse.glsl', inverse)
import transpose from './stack-gl/transpose.glsl'
shaderLibrary.setShaderSnippet('stack-gl/transpose.glsl', transpose)
import quadVertexFromID from './utils/quadVertexFromID.glsl'
shaderLibrary.setShaderSnippet('utils/quadVertexFromID.glsl', quadVertexFromID)
import unpackHDR from './utils/unpackHDR.glsl'
shaderLibrary.setShaderSnippet('utils/unpackHDR.glsl', unpackHDR)
import glslAtmosphere from './wwwtyro/glsl-atmosphere.glsl'
shaderLibrary.setShaderSnippet('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
import skyFragment from './zz85/skyFragment.glsl'
shaderLibrary.setShaderSnippet('zz85/skyFragment.glsl', skyFragment)
