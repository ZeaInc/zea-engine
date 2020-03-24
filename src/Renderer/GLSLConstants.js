import {
  SInt32,
  UInt32,
  Float32,
  Vec2,
  Vec3,
  Vec4,
  Mat3,
  Mat4,
  Color,
} from '../Math/index'
import { BaseImage } from '../SceneTree/BaseImage.js'

const glslTypes = {
  bool: Boolean,
  int: SInt32,
  uint: UInt32,
  float: Float32,
  ivec2: Vec2,
  ivec3: Vec3,
  ivec4: Vec4,
  vec2: Vec2,
  vec3: Vec3,
  vec4: Vec4,
  color: Color,
  mat3: Mat3,
  mat4: Mat4,
  sampler2D: BaseImage,
}

export { glslTypes }
