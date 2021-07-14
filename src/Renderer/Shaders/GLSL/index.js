import { shaderLibrary } from '../../ShaderLibrary.js'

import computeViewNormal from './computeViewNormal.glsl'
import calcFatLinesViewPos from './calcFatLinesViewPos.glsl'
import constants from './constants.glsl'
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
import imageAtlas from './imageAtlas.glsl'
import imagePyramid from './imagePyramid.glsl'
import ImageStream from './ImageStream.glsl'
import ImportanceSampleGGX from './ImportanceSampleGGX.glsl'
import materialparams from './materialparams.glsl'
import modelMatrix from './modelMatrix.glsl'
import PBRSurfaceRadiance from './PBRSurfaceRadiance.glsl'
import SHCoeffs from './SHCoeffs.glsl'
import fxaaApply from './fxaa-apply.glsl'
import fxaaTexcoords from './fxaa-texcoords.glsl'
import fxaa from './fxaa.glsl'
import exposure from './exposure.glsl'
import sky from './sky.glsl'
import tonemapFilmic from './tonemap-filmic.glsl'
import tonemapReinhard from './tonemap-reinhard.glsl'
import tonemapUncharted2 from './tonemap-uncharted2.glsl'
import diffuseLambert from './diffuse-lambert.glsl'
import gamma from './gamma.glsl'
import inverse from './inverse.glsl'
import transpose from './transpose.glsl'
import quadVertexFromID from './quadVertexFromID.glsl'
import unpackHDR from './unpackHDR.glsl'
import glslAtmosphere from './glsl-atmosphere.glsl'
import skyFragment from './skyFragment.glsl'
import GLSLBinReader from './GLSLBinReader.glsl'

shaderLibrary.setShaderModule('GLSLBinReader.glsl', GLSLBinReader)
shaderLibrary.setShaderModule('computeViewNormal.glsl', computeViewNormal)
shaderLibrary.setShaderModule('calcFatLinesViewPos.glsl', calcFatLinesViewPos)
shaderLibrary.setShaderModule('constants.glsl', constants)
shaderLibrary.setShaderModule('convolve-helpers.glsl', convolveHelpers)
shaderLibrary.setShaderModule('cutaways.glsl', cutaways)
shaderLibrary.setShaderModule('debugColors.glsl', debugColors)
shaderLibrary.setShaderModule('drawItemId.glsl', drawItemId)
shaderLibrary.setShaderModule('drawItemTexture.glsl', drawItemTexture)
shaderLibrary.setShaderModule('envmap-dualfisheye.glsl', envmapDualfisheye)
shaderLibrary.setShaderModule('envmap-equirect.glsl', envmapEquirect)
shaderLibrary.setShaderModule('envmap-octahedral.glsl', envmapOctahedral)
shaderLibrary.setShaderModule('GLSLBits.glsl', GLSLBits)
shaderLibrary.setShaderModule('GLSLUtils.glsl', GLSLUtils)
shaderLibrary.setShaderModule('glslxfo.glsl', glslxfo)
shaderLibrary.setShaderModule('Hammersley.glsl', Hammersley)
shaderLibrary.setShaderModule('imageAtlas.glsl', imageAtlas)
shaderLibrary.setShaderModule('imagePyramid.glsl', imagePyramid)
shaderLibrary.setShaderModule('ImageStream.glsl', ImageStream)
shaderLibrary.setShaderModule('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
shaderLibrary.setShaderModule('materialparams.glsl', materialparams)
shaderLibrary.setShaderModule('modelMatrix.glsl', modelMatrix)
shaderLibrary.setShaderModule('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
shaderLibrary.setShaderModule('SHCoeffs.glsl', SHCoeffs)
shaderLibrary.setShaderModule('fxaa-apply.glsl', fxaaApply)
shaderLibrary.setShaderModule('fxaa-texcoords.glsl', fxaaTexcoords)
shaderLibrary.setShaderModule('fxaa.glsl', fxaa)
shaderLibrary.setShaderModule('exposure.glsl', exposure)
shaderLibrary.setShaderModule('sky.glsl', sky)
shaderLibrary.setShaderModule('tonemap-filmic.glsl', tonemapFilmic)
shaderLibrary.setShaderModule('tonemap-reinhard.glsl', tonemapReinhard)
shaderLibrary.setShaderModule('tonemap-uncharted2.glsl', tonemapUncharted2)
shaderLibrary.setShaderModule('diffuse-lambert.glsl', diffuseLambert)
shaderLibrary.setShaderModule('gamma.glsl', gamma)
shaderLibrary.setShaderModule('inverse.glsl', inverse)
shaderLibrary.setShaderModule('transpose.glsl', transpose)
shaderLibrary.setShaderModule('quadVertexFromID.glsl', quadVertexFromID)
shaderLibrary.setShaderModule('unpackHDR.glsl', unpackHDR)
shaderLibrary.setShaderModule('glsl-atmosphere.glsl', glslAtmosphere)
shaderLibrary.setShaderModule('skyFragment.glsl', skyFragment)
