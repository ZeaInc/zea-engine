
attribute float vertexIDs;

vec2 getQuadVertexPositionFromID(){
    int vertexID = int(vertexIDs);
    if(vertexID == 0)
        return vec2(-0.5, -0.5);
    else if(vertexID == 1)
        return vec2(0.5, -0.5);
    else if(vertexID == 2)
        return vec2(-0.5, 0.5);
    else if(vertexID == 3)
        return vec2(0.5, 0.5);
    return vec2(0,0);
}
