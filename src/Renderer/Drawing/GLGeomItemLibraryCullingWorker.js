/* eslint-disable camelcase */
const vec3_normalize = (vec) => {
  let len = vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]
  if (len < Number.EPSILON) {
    return [0, 0, 0]
  }
  len = 1.0 / Math.sqrt(len)
  return [vec[0] * len, vec[1] * len, vec[2] * len]
}
const vec3_subtract = (vec1, vec2) => {
  return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]]
}
const vec3_dot = (vec1, vec2) => {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]
}
const vec3_length = (vec) => {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
}
const vec3_scale = (vec, scl) => {
  return [vec[0] * scl, vec[1] * scl, vec[2] * scl]
}
const vec2_scale = (vec, scl) => {
  return [vec[0] * scl, vec[1] * scl]
}
const vec2_length = (vec) => {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1])
}

const quat_conjugate = (quat) => {
  return [-quat[0], -quat[1], -quat[2], quat[3]]
}
const quat_multiply = (quat1, quat2) => {
  const ax = quat1[0]
  const ay = quat1[1]
  const az = quat1[2]
  const aw = quat1[3]
  const bx = quat2[0]
  const by = quat2[1]
  const bz = quat2[2]
  const bw = quat2[3]

  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}
const quat_rotateVec3 = (quat, vec3) => {
  const vq = [vec3[0], vec3[1], vec3[2], 0.0]
  const pq = quat_multiply(quat_multiply(quat, vq), quat_conjugate(quat))
  return [pq[0], pq[1], pq[2]]
}

// ///////////////////////////////////////////////
// View data.
const geomItemsData = []
const frustumCulled = []
let culledCount = 0
let newlyCulled = []
let newlyUnCulled = []

let cameraPos
let cameraInvOri
let isOrthographic = false
let frustumHeight = 0
let frustumWidth = 0
let frustumHalfAngleX = 0
let frustumHalfAngleY = 0
let solidAngleLimit = 0.004

let cullReason = {
  solidAngle: 0,
  frustum: 0,
  tooClose: 0,
  behind: 0,
}

const cull = (index) => {
  if (!frustumCulled[index]) {
    frustumCulled[index] = true
    culledCount++
    newlyCulled.push(index)
  }
}
const unCull = (index) => {
  if (frustumCulled[index]) {
    frustumCulled[index] = false
    culledCount--
    newlyUnCulled.push(index)
  }
}

const checkGeomItem = (geomItemData) => {
  if (!geomItemData || !cameraPos) return
  if (!geomItemData.visible) return

  // Some items, like Handles that
  if (!geomItemData.cullable) {
    unCull(geomItemData.id)
    return
  }
  const boundingRadius = geomItemData.boundingRadius

  if (isOrthographic) {
    // Cull very small items
    // Note: when in VR, the FoV becomes very wide and the pixel
    // height varies. It seems more consistent to just use solidAngle
    // which is resolution invariant.
    const vheight = boundingRadius / frustumHeight
    if (solidAngleLimit > 0 && vheight < solidAngleLimit) {
      cull(geomItemData.id)
      return
    }

    // Now we check if the item is within the view frustum.
    // We need the solid angle of the item for each axis (X & Y)
    // This is because at the corners of the screen, the object is slightly
    // further away, so the solid angle calculated above gets smaller.
    // This was causing items with big bounding spheres to be culled too early
    // at the corner of the screen.
    const vec = vec3_subtract(geomItemData.pos, cameraPos)
    const viewPos = quat_rotateVec3(cameraInvOri, vec)
    if (
      Math.abs(viewPos[0]) - boundingRadius > frustumWidth * 0.5 ||
      Math.abs(viewPos[1]) - boundingRadius > frustumHeight * 0.5
    ) {
      cull(geomItemData.id)
      return
    }
  } else {
    const vec = vec3_subtract(geomItemData.pos, cameraPos)
    const dist = vec3_length(vec)
    // unCull items close to the view.
    if (dist < boundingRadius) {
      cullReason.tooClose++
      unCull(geomItemData.id)
      return
    }
    // Cull very small items
    // Note: when in VR, the FoV becomes very wide and the pixel
    // height varies. It seems more consistent to just use solidAngle
    // which is resolution invariant.
    const solidAngle = Math.asin(boundingRadius / dist)
    if (solidAngleLimit > 0 && solidAngle < solidAngleLimit) {
      cullReason.solidAngle++
      cull(geomItemData.id)
      return
    }

    // Now we check if the item is within the view frustum.
    // We need the solid angle of the item for each axis (X & Y)
    // This is because at the corners of the screen, the object is slightly
    // further away, so the solid angle calculated above gets smaller.
    // This was causing items with big bounding spheres to be culled too early
    // at the corner of the screen.
    const viewPos = quat_rotateVec3(cameraInvOri, vec)
    const viewVecXZ = [viewPos[0], viewPos[2]]
    const viewVecYZ = [viewPos[1], viewPos[2]]
    const distX = vec2_length(viewVecXZ)
    const distY = vec2_length(viewVecYZ)
    const solidAngleXZ = Math.asin(boundingRadius / distX)
    const solidAngleYZ = Math.asin(boundingRadius / distY)
    const viewVecNormXZ = vec2_scale(viewVecXZ, 1 / distX)
    const viewVecNormYZ = vec2_scale(viewVecYZ, 1 / distY)

    let viewAngle
    // If an item is behind the viewer
    if (viewPos[2] > 0) {
      cullReason.behind++
      viewAngle = [
        Math.PI - Math.abs(Math.asin(viewVecNormXZ[0])) - solidAngleXZ,
        Math.PI - Math.abs(Math.asin(viewVecNormYZ[0])) - solidAngleYZ,
      ]
    } else {
      viewAngle = [
        Math.abs(Math.asin(viewVecNormXZ[0])) - solidAngleXZ,
        Math.abs(Math.asin(viewVecNormYZ[0])) - solidAngleYZ,
      ]
    }
    // console.log(geomItemData.id, 'angle To Item:', frustumHalfAngleX, viewAngle[0], frustumHalfAngleY, viewAngle[1])
    if (viewAngle[0] > frustumHalfAngleX || viewAngle[1] > frustumHalfAngleY) {
      cullReason.frustum++
      cull(geomItemData.id)
      return
    }
  }

  unCull(geomItemData.id)
}

const onViewPortChanged = (data, postMessage) => {
  if (data.isOrthographic) {
    isOrthographic = true
    frustumHeight = data.frustumHeight
    frustumWidth = data.frustumWidth
  } else {
    isOrthographic = false
    frustumHalfAngleX = data.frustumHalfAngleX
    frustumHalfAngleY = data.frustumHalfAngleY
  }

  solidAngleLimit = data.solidAngleLimit
  if (cameraPos && cameraInvOri) {
    geomItemsData.forEach(checkGeomItem)
    onDone(postMessage)
  }
}

const onViewChanged = (data, postMessage) => {
  cameraPos = data.cameraPos
  cameraInvOri = quat_conjugate(data.cameraOri)
  solidAngleLimit = data.solidAngleLimit
  geomItemsData.forEach(checkGeomItem)
  onDone(postMessage)
}

const onDone = (postMessage) => {
  // console.log('onDone newlyCulled:', newlyCulled.length, 'newlyUnCulled:', newlyUnCulled.length)
  if (newlyCulled.length > 0 || newlyUnCulled.length > 0) {
    // console.log('CullResults culled:', culledCount, 'visible:', geomItemsData.length - 1 - culledCount, cullReason)
    // console.log('CullResults culled:', culledCount, 'visible:', geomItemsData.length - 1 - culledCount)
    postMessage({ type: 'CullResults', newlyCulled, newlyUnCulled })
    newlyCulled = []
    newlyUnCulled = []
  } else {
    postMessage({ type: 'Done' })
  }
  cullReason = {
    solidAngle: 0,
    frustum: 0,
    tooClose: 0,
    behind: 0,
  }
}

const handleMessage = (data, postMessage) => {
  if (data.type == 'ViewportChanged') {
    onViewPortChanged(data, postMessage)
  } else if (data.type == 'ViewChanged') {
    onViewChanged(data, postMessage)
  } else if (data.type == 'UpdateGeomItems') {
    data.removedItemIndices.forEach((id) => {
      geomItemsData[id] = null
    })
    data.geomItems.forEach((geomItem) => {
      // New geoms default to being un-culled
      if (!geomItemsData[geomItem.id]) frustumCulled[geomItem.id] = false
      geomItemsData[geomItem.id] = geomItem
      checkGeomItem(geomItemsData[geomItem.id])
    })
    onDone(postMessage)
  }
}

self.onmessage = function (event) {
  handleMessage(event.data, self.postMessage)
}

export { handleMessage }
