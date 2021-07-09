

vec3 getDebugColor(float id) {
    int sel = int(round(mod(round(id), 16.0)));
    
    if(sel==0)
        return vec3(0.0, 1.0, 1.0);
    else if (sel==1)
        return vec3(0.0, 1.0, 0.0);
    else if (sel==2)
        return vec3(1.0, 0.0, 1.0);
    else if (sel==3)
        return vec3(0.75, 0.75, 0.0);
    else if (sel==4)
        return vec3(0.0, 0.75, 0.75);
    else if (sel==5)
        return vec3(0.75, 0.0, 0.75);
    else if (sel==6)
        return vec3(0.45, 0.95, 0.0);
    else if (sel==7)
        return vec3(0.0, 0.45, 0.95);
    else if (sel==8)
        return vec3(0.95, 0.0, 0.45);
    else if (sel==9)
        return vec3(0.95, 0.45, 0.0);
    else if (sel==10)
        return vec3(0.0, 0.95, 0.45);
    else if (sel==11)
        return vec3(0.45, 0.0, 0.95);
    else if (sel==12)
        return vec3(0.45, 0.45, 0.95);
    else if (sel==13)
        return vec3(0.0, 0.0, 0.45);
    else if (sel==14)
        return vec3(0.0, 0.45, 0.45);
    else if (sel==15)
        return vec3(0.45, 0.0, 0.45);
    else return vec3(0.2, 0.2, 0.2);
}


