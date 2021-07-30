
const int GEOMITEM_FLAG_CUTAWAY = 1; // 1<<0;
const int GEOMITEM_INVISIBLE_IN_GEOMDATA = 2; // 1<<1;


#define RAY_EPS 0.0000001
struct Ray {
  vec3 start;
  vec3 dir;
};

float intersectRayPlane(Ray ray, Ray plane) {
  vec3 w = ray.start - plane.start;
  float D = dot(plane.dir, ray.dir);
  float N = dot(-plane.dir, w);

  if (abs(D) < RAY_EPS) {
    // segment is parallel to plane
    if (N == 0.0)
      return -1.0; // segment lies in plane
    else
      return -1.0; // no intersection
  }
  // they are not parallel
  // compute intersect param
  float sI = N / D;
  if (sI < -RAY_EPS) {
    return -1.0; // no intersection
  }
  return sI;
}


bool cutaway(vec3 worldPos, vec3 planeNormal, float planeDist) {

  vec3 planePos = planeNormal * planeDist;
  vec3 planeDir = worldPos + planePos;
  float planeOffset = dot(planeDir, planeNormal);
  if (planeOffset > 0.0) {
    return true;
  }
  return false;
}
