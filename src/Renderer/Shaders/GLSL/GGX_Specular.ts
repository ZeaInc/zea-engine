import { shaderLibrary } from '../../ShaderLibrary.js'
import './ImagePyramid.js'
import './envmap-octahedral.js'

shaderLibrary.setShaderModule(
  'GGX_Specular.glsl',
  `


<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>
<%include file="utils/imagePyramid.glsl"/>

// uniform ImageAtlas envMap;
// see: GLImageAtlas.js: line 460.
uniform sampler2D   envMapPyramid;
uniform sampler2D   envMapPyramid_layout;
uniform vec4        envMapPyramid_desc;


vec3 sampleEnvMap(vec3 dir, float roughness) {
    return sampleImagePyramid(dirToSphOctUv(dir), roughness, envMapPyramid_layout, envMapPyramid, envMapPyramid_desc).rgb;
}


// Borrowed heavily from here: http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx

vec3 Fresnel_Schlick(float cosT, vec3 F0)
{
    return F0 + (vec3(1.0)-F0) * vec3(pow( 1.0 - cosT, 5.0));

    // for now we calculate this in the suface shader
    // float schlick = reflectance + pow((1.0-reflectance)*(1.0-dot(N,V)), 5.0);
}

float chiGGX(float v)
{
    return v > 0.0 ? 1.0 : 0.0;
}

float saturate(float v)
{
    return clamp(v, 0.0, 1.0);
}

vec3 saturate(vec3 v)
{
    return clamp(v, vec3(0.0), vec3(1.0));
}

float saturatedDot( in vec3 a, in vec3 b )
{
    return max( dot( a, b ), 0.0 );   
}

float GGX_PartialGeometryTerm(vec3 v, vec3 n, vec3 h, float alpha)
{
    float VoH2 = saturate(dot(v,h));
    float chi = chiGGX( VoH2 / saturate(dot(v,n)) );
    VoH2 = VoH2 * VoH2;
    float tan2 = ( 1.0 - VoH2 ) / VoH2;
    return (chi * 2.0) / ( 1.0 + sqrt( 1.0 + alpha * alpha * tan2 ) );
}

vec3 GGX_Specular_PrefilteredEnv(vec3 normal, vec3 viewVector, float roughness, float fresnel)
{
    vec3 reflectionVector = reflect(-viewVector, normal);
    vec3 radiance = vec3(0.0);
    float NoV = saturate(dot(normal, viewVector));

    vec3 sampleVector = reflectionVector;

    // Calculate the half vector
    vec3 halfVector = normalize(sampleVector + viewVector);
    float cosT = saturatedDot(reflectionVector, normal);
    float sinT = sqrt( 1.0 - cosT * cosT);

    // Calculate fresnel
    // vec3 fresnel = Fresnel_Schlick( saturate(dot( halfVector, viewVector ) ), F0 );
    // Geometry term
    float geometry = GGX_PartialGeometryTerm(viewVector, normal, halfVector, clamp(roughness, 0.01, 1.0)) * GGX_PartialGeometryTerm(reflectionVector, normal, halfVector, clamp(roughness, 0.01, 1.0));

    // Calculate the Cook-Torrance denominator
    float denominator = clamp( 4.0 * (NoV * saturate(dot(halfVector, normal)) + 0.05), 0.0, 1.0 );
    // kS += fresnel;

    // Accumulate the radiance
    vec3 envColor = sampleEnvMap(reflectionVector, roughness);
    radiance += envColor * geometry * fresnel * sinT / denominator;
    //radiance += envColor * fresnel; // Removing "geometry" for now until we construct a better geometric shading term

    return radiance;        
}
`
)
