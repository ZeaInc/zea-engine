


#ifdef GL_ES
precision highp float;
#endif

/*

Based on "A Practical Analytic Model for Daylight"
aka The Preetham Model, the de facto standard analytic skydome model
http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf

First implemented by Simon Wallner http://www.simonwallner.at/projects/atmospheric-scattering

Improved by Martin Upitis http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR

Three.js integration by zz85 http://twitter.com/blurspline

Plask / Pex integration by Marcin Ignac http://twitter.com/marcinignac, 2015-09
*/


vec3 cameraPos = vec3(0.0, 0.0, 0.0);

const float luminance = 1.0;
const float turbidity = 10.0;
const float reileigh = 2.0;
const float mieCoefficient = 0.005;
const float mieDirectionalG = 0.8;

//uniform float luminance; //1.0
//uniform float turbidity; //10.0
//uniform float reileigh; //2.0
//uniform float mieCoefficient; //0.005
//uniform float mieDirectionalG; //0.8


float reileighCoefficient = reileigh;

// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003; // refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
// 288.15K and 1013mb (sea level -45 celsius)
const float pn = 0.035; // depolatization factor for standard air

// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

// mie stuff
// K coefficient for the primaries
const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

// optical length at zenith for molecules
const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;
const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
// 66 arc seconds -> degrees, and the cosine of that

// earth shadow hack
const float cutoffAngle = pi/1.95;
const float steepness = 1.5;


vec3 totalRayleigh(vec3 lambda)
{
    return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));
}

float rayleighPhase(float cosTheta)
{
    return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
    // return (1.0 / (3.0*pi)) * (1.0 + pow(cosTheta, 2.0));
    // return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T)
{
    float c = (0.2 * T ) * 10E-18;
    return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g)
{
    return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos)
{
    return EE * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

// float logLuminance(vec3 c)
// {
// return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);
// }

// Filmic ToneMapping http://filmicgames.com/archives/75
float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x)
{
    return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}


vec3 sky(vec3 sunPosition, vec3 worldNormal) {
    vec3 sunDirection = normalize(sunPosition);
    float sunfade = 1.0-clamp(1.0-exp((sunPosition.y/450000.0)),0.0,1.0);

    // luminance = 1.0 ;// vWorldPosition.y / 450000. + 0.5; //sunPosition.y / 450000. * 1. + 0.5;

    // gl_FragColor = vec4(sunfade, sunfade, sunfade, 1.0);

    reileighCoefficient = reileighCoefficient - (1.0* (1.0-sunfade));

    float sunE = sunIntensity(dot(sunDirection, up));

    // extinction (absorbtion + out scattering)
    // rayleigh coefficients
    vec3 betaR = totalRayleigh(lambda) * reileighCoefficient;

    // mie coefficients
    vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

    // optical length
    // cutoff angle at 90 to avoid singularity in next formula.
    //float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));
    float zenithAngle = acos(max(0.0, dot(up, normalize(worldNormal))));
    float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
    float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));



    // combined extinction factor
    vec3 Fex = exp(-(betaR * sR + betaM * sM));

    // in scattering
    float cosTheta = dot(normalize(worldNormal), sunDirection);

    float rPhase = rayleighPhase(cosTheta*0.5+0.5);
    vec3 betaRTheta = betaR * rPhase;

    float mPhase = hgPhase(cosTheta, mieDirectionalG);
    vec3 betaMTheta = betaM * mPhase;


    vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
    Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));

    //nightsky
    vec3 direction = normalize(worldNormal);
    float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]
    float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]
    vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
    // vec3 L0 = texture2D(skySampler, uv).rgb+0.1 * Fex;
    vec3 L0 = vec3(0.1) * Fex;

    // composition + solar disc
    //if (cosTheta > sunAngularDiameterCos)
    float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);
    // if (normalize(vWorldPosition - cameraPos).y>0.0)
    L0 += (sunE * 19000.0 * Fex)*sundisk;


    vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));

    vec3 texColor = (Lin+L0);
    texColor *= 0.04 ;
    texColor += vec3(0.0,0.001,0.0025)*0.3;

    float g_fMaxLuminance = 1.0;
    float fLumScaled = 0.1 / luminance;
    float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);

    float ExposureBias = fLumCompressed;

    //vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);
    vec3 curr = texColor;
    vec3 color = curr*whiteScale;

    vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));


    return retColor;
}


//////////////////////////////////////////////////
// https://www.shadertoy.com/view/lss3DS [ in the comments]
// In complement : real position of sun at a given date and latitude longitude

const float 
    pi2 = 2.*PI,
    AU = 149597870.61, // Astronomical Unit = Mean distance of the earth from the sun - Km
    toRad = PI/180.,
    toDeg = 180./PI;
    
float julianDay2000(in float unixTimeS) {
    return (unixTimeS / 86400.0) - 10957.5;// = + 2440587.5-2451545;
}

vec2 SunAtTime(in float julianDay2000, in float latitude, in float longitude) {
    float zs,rightAscention, declination, sundist,
        t  = julianDay2000, //= jd - 2451545., // nb julian days since 01/01/2000 (1 January 2000 = 2451545 Julian Days)
        t0 = t/36525.,           // nb julian centuries since 2000      
        t1 = t0+1.,              // nb julian centuries since 1900
        Ls = fract(.779072+.00273790931*t)*pi2, // mean longitude of sun
        Ms = fract(.993126+.0027377785 *t)*pi2, // mean anomaly of sun
        GMST = 280.46061837 + 360.98564736629*t + (0.000387933 - t0/38710000.)*t0*t0, // Greenwich Mean Sidereal Time   
    // position of sun
        v = (.39785-.00021*t1)*sin(Ls)-.01*sin(Ls-Ms)+.00333*sin(Ls+Ms),
        u = 1.-.03349*cos(Ms)-.00014*cos(2.*Ls)+.00008*cos(Ls),
        w = -.0001-.04129 * sin(2.*Ls)+(.03211-.00008*t1)*sin(Ms)
            +.00104*sin(2.*Ls-Ms)-.00035*sin(2.*Ls+Ms);
    // calcul distance of sun
    sundist = 1.00021*sqrt(u)*AU;
    // calcul right ascention
    zs = w / sqrt(u-v*v);
    rightAscention = Ls + atan(zs/sqrt(1.-zs*zs));
    // calcul declination
    zs = v / sqrt(u);
    declination = atan(zs/sqrt(1.-zs*zs));

    // position relative to geographic location
    float
        sin_dec = sin(declination),   cos_dec = cos(declination),
        sin_lat = sin(toRad*latitude),cos_lat = cos(toRad*latitude),
        lmst = mod((GMST + longitude)/15., 24.);
    if (lmst<0.) lmst += 24.;
    lmst = toRad*lmst*15.;
    float
        ha = lmst - rightAscention,       
        elevation = asin(sin_lat * sin_dec + cos_lat * cos_dec * cos(ha)),
        azimuth   = acos((sin_dec - (sin_lat*sin(elevation))) / (cos_lat*cos(elevation)));
    
    return vec2(sin(ha)>0.? azimuth : pi2-azimuth, elevation);
}

