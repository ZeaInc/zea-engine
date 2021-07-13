

vec3 decodeHDR(const in vec3 ldrPixel, const in float cdmAlpha) {
    float avg = (cdmAlpha * 16.0 - 8.0);
    float scl = 1.0;
    vec3 color;
    color.x = (tan((ldrPixel.x-0.5)*1.5)/scl)+avg;
    color.y = (tan((ldrPixel.y-0.5)*1.5)/scl)+avg;
    color.z = (tan((ldrPixel.z-0.5)*1.5)/scl)+avg;

    // convert from logarithmic curve to linear curve.
    // subtract the epsilon that was added during encoding.
    const float eps = 0.001;
    color.x = pow(10.0, color.x) - eps;
    color.y = pow(10.0, color.y) - eps;
    color.z = pow(10.0, color.z) - eps;
    return color;
}

vec3 decodeHDR(sampler2D ldrSampler, sampler2D cdmSampler, vec2 texCoord) {
#ifdef ENABLE_ES3
    float cdm = texture2D(cdmSampler, texCoord).r;
#else
    float cdm = texture2D(cdmSampler, texCoord).a;
#endif
    return decodeHDR(texture2D(ldrSampler, texCoord).rgb, cdm);
}

