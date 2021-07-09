import { shaderLibrary } from '../../ShaderLibrary.js'

import snip2 from '../GLSLSnippets/testSnippet/snippet2.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/snippet2.glsl', snip2) // name of import used in glsl
import snip from '../GLSLSnippets/testSnippet/snippet.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/snippet.glsl', snip) // name of import used in glsl

import rsnip from '../GLSLSnippets/testSnippet/rsnip.glsl' // where to find the file
shaderLibrary.setShaderSnippet('testSnippet/rsnip.glsl', rsnip) // name of import used in glsl

import computeViewNormal from '../GLSLSnippets/computeViewNormal.glsl'
shaderLibrary.setShaderSnippet('computeViewNormal.glsl', computeViewNormal)
import constants from '../GLSLSnippets/math/constants.glsl'
shaderLibrary.setShaderSnippet('math/constants.glsl', constants)
import convolveHelpers from '../GLSLSnippets/convolve-helpers.glsl'
shaderLibrary.setShaderSnippet('convolve-helpers.glsl', convolveHelpers)
import cutaways from '../GLSLSnippets/cutaways.glsl'
shaderLibrary.setShaderSnippet('cutaways.glsl', cutaways)
import debugColors from '../GLSLSnippets/debugColors.glsl'
shaderLibrary.setShaderSnippet('debugColors.glsl', debugColors)
import drawItemId from '../GLSLSnippets/drawItemId.glsl'
shaderLibrary.setShaderSnippet('drawItemId.glsl', drawItemId)
import drawItemTexture from '../GLSLSnippets/drawItemTexture.glsl'
shaderLibrary.setShaderSnippet('drawItemTexture.glsl', drawItemTexture)
import envmapDualfisheye from '../GLSLSnippets/envmap-dualfisheye.glsl'
shaderLibrary.setShaderSnippet('envmap-dualfisheye.glsl', envmapDualfisheye)
import envmapEquirect from '../GLSLSnippets/envmap-equirect.glsl'
shaderLibrary.setShaderSnippet('envmap-equirect.glsl', envmapEquirect)
import envmapOctahedral from '../GLSLSnippets/envmap-octahedral.glsl'
shaderLibrary.setShaderSnippet('envmap-octahedral.glsl', envmapOctahedral)
import GLSLBits from '../GLSLSnippets/GLSLBits.glsl'
shaderLibrary.setShaderSnippet('GLSLBits.glsl', GLSLBits)
import GLSLUtils from '../GLSLSnippets/GLSLUtils.glsl'
shaderLibrary.setShaderSnippet('GLSLUtils.glsl', GLSLUtils)
import glslxfo from '../GLSLSnippets/glslxfo.glsl'
shaderLibrary.setShaderSnippet('glslxfo.glsl', glslxfo)
import Hammersley from '../GLSLSnippets/Hammersley.glsl'
shaderLibrary.setShaderSnippet('Hammersley.glsl', Hammersley)
import imageAtlas from '../GLSLSnippets/utils/imageAtlas.glsl'
shaderLibrary.setShaderSnippet('utils/imageAtlas.glsl', imageAtlas)
import imagePyramid from '../GLSLSnippets/imagePyramid.glsl'
shaderLibrary.setShaderSnippet('imagePyramid.glsl', imagePyramid)
import ImageStream from '../GLSLSnippets/ImageStream.glsl'
shaderLibrary.setShaderSnippet('ImageStream.glsl', ImageStream)
import ImportanceSampleGGX from '../GLSLSnippets/ImportanceSampleGGX.glsl'
shaderLibrary.setShaderSnippet('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
import materialparams from '../GLSLSnippets/materialparams.glsl'
shaderLibrary.setShaderSnippet('materialparams.glsl', materialparams)
import modelMatrix from '../GLSLSnippets/modelMatrix.glsl'
shaderLibrary.setShaderSnippet('modelMatrix.glsl', modelMatrix)
import PBRSurfaceRadiance from '../GLSLSnippets/PBRSurfaceRadiance.glsl'
shaderLibrary.setShaderSnippet('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
import SHCoeffs from '../GLSLSnippets/SHCoeffs.glsl'
shaderLibrary.setShaderSnippet('SHCoeffs.glsl', SHCoeffs)
import fxaaApply from '../GLSLSnippets/mattdesl/fxaa-apply.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa-apply.glsl', fxaaApply)
import fxaaTexcoords from '../GLSLSnippets/mattdesl/fxaa-texcoords.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)
import fxaa from '../GLSLSnippets/mattdesl/fxaa.glsl'
shaderLibrary.setShaderSnippet('mattdesl/fxaa.glsl', fxaa)
import exposure from '../GLSLSnippets/pragmatic-pbr/exposure.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/exposure.glsl', exposure)
import sky from '../GLSLSnippets/pragmatic-pbr/sky.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/sky.glsl', sky)
import tonemapFilmic from '../GLSLSnippets/pragmatic-pbr/tonemap-filmic.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-filmic.glsl', tonemapFilmic)
import tonemapReinhard from '../GLSLSnippets/pragmatic-pbr/tonemap-reinhard.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-reinhard.glsl', tonemapReinhard)
import tonemapUncharted2 from '../GLSLSnippets/pragmatic-pbr/tonemap-uncharted2.glsl'
shaderLibrary.setShaderSnippet('pragmatic-pbr/tonemap-uncharted2.glsl', tonemapUncharted2)
import diffuseLambert from '../GLSLSnippets/stack-gl/diffuse-lambert.glsl'
shaderLibrary.setShaderSnippet('stack-gl/diffuse-lambert.glsl', diffuseLambert)
import gamma from '../GLSLSnippets/stack-gl/gamma.glsl'
shaderLibrary.setShaderSnippet('stack-gl/gamma.glsl', gamma)
import inverse from '../GLSLSnippets/stack-gl/inverse.glsl'
shaderLibrary.setShaderSnippet('stack-gl/inverse.glsl', inverse)
import transpose from '../GLSLSnippets/stack-gl/transpose.glsl'
shaderLibrary.setShaderSnippet('stack-gl/transpose.glsl', transpose)
import quadVertexFromID from '../GLSLSnippets/utils/quadVertexFromID.glsl'
shaderLibrary.setShaderSnippet('utils/quadVertexFromID.glsl', quadVertexFromID)
import unpackHDR from '../GLSLSnippets/utils/unpackHDR.glsl'
shaderLibrary.setShaderSnippet('utils/unpackHDR.glsl', unpackHDR)
import glslAtmosphere from '../GLSLSnippets/wwwtyro/glsl-atmosphere.glsl'
shaderLibrary.setShaderSnippet('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
import skyFragment from '../GLSLSnippets/zz85/skyFragment.glsl'
shaderLibrary.setShaderSnippet('zz85/skyFragment.glsl', skyFragment)
