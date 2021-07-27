import { GLShader } from '../GLShader.js'

// eslint-disable-next-line require-jsdoc
export class ReductionShader extends GLShader {
  /**
   * Create an atlas layout shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage(
      'VERTEX_SHADER',
      `

precision highp float;

uniform int floatGeomBuffer;
uniform int reductionTextureWidth;
uniform sampler2D geomDataTexture;

ivec2 texelCoordFromVertexId(){
  ivec2 texSize = textureSize(geomDataTexture, 0);
  return ivec2(
    gl_VertexID % texSize.x, 
    gl_VertexID / texSize.x
    );
}

vec2 pointPositionFromGeomItemId(int geomItemId){
  vec2 result = vec2(
    (float(geomItemId % reductionTextureWidth) + 0.5) / float(reductionTextureWidth), 
    (float(geomItemId / reductionTextureWidth) + 0.5) / float(reductionTextureWidth)
    );
  return vec2(-1.0, -1.0) + (result * 2.0);
}

void main()
{
  int geomItemId = -1;

  // Get the texel coordinate in the source geomdata buffer.
  // there is one point for every pixel in the geomdata texture.
  ivec2 texelCoord = texelCoordFromVertexId();
  if(floatGeomBuffer != 0) {
    geomItemId = int(texelFetch(geomDataTexture, texelCoord, 0).g + 0.5);
  } else {
    // decode the id from 2 uint8 values into a 16 bit float
    // vec2 twoXUInt8 = int(texture2D(geomDataTexture, texelCoord).ba;
    // float float16bits = decode16BitFloatInto2xUInt8(twoXUInt8);
    // geomItemId = int(float16bits);
  }

  if (geomItemId > 0) {
    vec2 position = pointPositionFromGeomItemId(geomItemId);
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 1.0;
  } else {
    // Move it off screen
    gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
  }
}

`
    )
    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = vec4(1.0, 1.0, 1.0, 1.0);

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}

`
    )
  }
}
