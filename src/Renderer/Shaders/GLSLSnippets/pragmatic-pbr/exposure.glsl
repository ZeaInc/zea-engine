
/*
* Get an exposure using the Saturation-based Speed method.
*/
float getSaturationBasedExposure(float aperture,
                                 float shutterSpeed,
                                 float iso)
{
    float l_max = (7800.0 / 65.0) * sqrt(aperture) / (iso * shutterSpeed);
    return 1.0 / l_max;
}

//White balance middle grey we are targetting for a good scene exposure
//https://en.wikipedia.org/wiki/Middle_gray
const float MIDDLE_GREY = 0.18;

/*
* Get an exposure using the Standard Output Sensitivity method.
* Accepts an additional parameter of the target middle grey.
*/
float getStandardOutputBasedExposure(float aperture,
                                     float shutterSpeed,
                                     float iso)
{
    //https://placeholderart.wordpress.com/2014/11/21/implementing-a-physically-based-camera-manual-exposure/
    //https://en.wikipedia.org/wiki/Film_speed#Standard_output_sensitivity_.28SOS.29
    //photometric exposure magic
    //represents the properties of lens
    float q = 0.65;

    //float l_avg = (1000.0f / 65.0f) * sqrt(aperture) / (iso * shutterSpeed);
    float l_avg = (1.0 / q) * sqrt(aperture) / (iso * shutterSpeed);
    //float l_avg = sqrt(aperture) / (iso * shutterSpeed);
    return MIDDLE_GREY / l_avg;
}

