import { Quaternion, Vector3 } from '@dcl/sdk/math'

export function rotateVectorAroundCenter(vec: Vector3, vecCenter: Vector3, rot: Quaternion){
    let vecResult = Vector3.subtract(vec, vecCenter)
    vecResult = Vector3.rotate(vecResult, rot)
    vecResult = Vector3.add(vecResult, vecCenter)

    return vecResult
}

export function isVectorInsideArea(vec: Vector3, areaPt1: Vector3, areaPt2: Vector3){
    let minX = Math.min(areaPt1.x, areaPt2.x)
    let maxX = Math.max(areaPt1.x, areaPt1.x)

    let minZ = Math.min(areaPt1.z, areaPt2.z)
    let maxZ = Math.max(areaPt1.z, areaPt1.z)

    return vec.x > minX && vec.x < maxX && vec.z > minZ && vec.z < maxZ
}
