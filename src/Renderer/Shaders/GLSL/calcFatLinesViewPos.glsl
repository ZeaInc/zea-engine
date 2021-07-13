

vec3 calcFatLinesViewPos(int vertexID, mat4 modelViewMatrix, inout vec3 viewNormal, inout vec2 texCoord, inout vec3 pos) {

  int seqentialIndex_0 = int(mod(segmentIndices.x, 2.));
  int seqentialIndex_1 = int(mod(segmentIndices.y, 2.));
  int index_0 = int(segmentIndices.x) / 2;
  int index_1 = int(segmentIndices.y) / 2;

  vec3 viewPos;
  vec4 data_0 = fetchTexel(positionsTexture, positionsTextureSize, index_0);
  vec4 data_1 = fetchTexel(positionsTexture, positionsTextureSize, index_1);

  vec4 pos_0 = modelViewMatrix * vec4(data_0.xyz, 1.0);
  vec4 pos_1 = modelViewMatrix * vec4(data_1.xyz, 1.0);
  // Note: multiply the per-vertex line thickness with the line thickness uniform value;
  float lineThickness_0 = LineThickness * data_0.w;
  float lineThickness_1 = LineThickness * data_1.w;

  if(vertexID < 2){
    pos = data_0.xyz;
    viewPos = pos_0.xyz;
  }
  else{
    pos = data_1.xyz;
    viewPos = pos_1.xyz;
  }
  if(pos_1 != pos_0){
    vec3 segmentDir = normalize(pos_1.xyz - pos_0.xyz);
    vec3 viewVector = normalize(viewPos);

    if(vertexID < 2){
      vec3 segmentStartDir = segmentDir;
      if(seqentialIndex_0 != 0){
        //if index_0 == 0, get the last index in the line as previous
        int index_prev = (index_0 > 0) ? (index_0-1) : (positionsTextureSize-1);
        vec4 data_prev = fetchTexel(positionsTexture, positionsTextureSize, index_prev);
        vec4 pos_prev = modelViewMatrix * vec4(data_prev.xyz, 1.0);
        segmentStartDir = normalize(segmentDir + normalize(pos_0.xyz - pos_prev.xyz));
        // segmentStartDir = segmentDir;
      }
      // vec3 startBiTangent = normalize(cross(segmentStartDir, viewVector));
      // viewNormal = normalize(cross(segmentStartDir, startBiTangent));
      vec3 startBiTangent = normalize(vec3(-segmentStartDir.y, segmentStartDir.x, 0.0));
      viewNormal = normalize(-viewVector);
      // Move the endpoints to overlap a bit more.
      //viewPos -= vec3(segmentStartDir * lineThickness_0 * 0.25);
      if(mod(vertexIDs, 2.0) == 0.0){
        viewPos += vec3(startBiTangent * lineThickness_0);
        texCoord.x = 1.0;
      }
      else{
        viewPos -= vec3(startBiTangent * lineThickness_0);
        texCoord.x = 0.0;
      }
      texCoord.y = 0.0;
    }
    else{
      vec3 segmentEndDir = segmentDir;
      if(seqentialIndex_1 != 0){
        //if index_1 == numPoints-1, get the first index in the line as next
        int index_next = (index_1 < (positionsTextureSize-1)) ? (index_1+1) : 0;
        vec4 data_next = fetchTexel(positionsTexture, positionsTextureSize, index_next);
        vec4 pos_next = modelViewMatrix * vec4(data_next.xyz, 1.0);
        segmentEndDir = normalize(segmentDir + normalize(pos_next.xyz - pos_1.xyz));
        // segmentEndDir = segmentDir;
      }
      // vec3 endBiTangent = normalize(cross(segmentEndDir, viewVector));
      // viewNormal = normalize(cross(segmentEndDir, endBiTangent));
      vec3 endBiTangent = normalize(vec3(-segmentEndDir.y, segmentEndDir.x, 0.0));
      viewNormal = normalize(-viewVector);
      // Move the endpoints to overlap a bit more.
      //viewPos += vec3(segmentEndDir * lineThickness_1 * 0.25);
      if(mod(vertexIDs, 2.0) == 0.0){
        viewPos += vec3(endBiTangent * lineThickness_1);
        texCoord.x = 1.0;
      }
      else{
        viewPos -= vec3(endBiTangent * lineThickness_1);
        texCoord.x = 0.0;
      }
      texCoord.y = 1.0;
    }

    // Move the line towards the viewer by the line thickness.
    // this is to avoid depth issues when lines are rendered over meshes. 
    viewPos.z += (lineThickness_0 + lineThickness_1) * 0.5;
  }

  return viewPos;
}

