import { Coordinate } from 'ol/coordinate'
import { toLonLat } from 'ol/proj'
import { getDistance } from 'ol/sphere'

const toDegreesMinutesSeconds = (angle: number): string => {
  const degrees = Math.floor(angle)
  const minutesNotTruncated = (angle - degrees) * 60
  const minutes = Math.floor(minutesNotTruncated)
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60)
  return `${degrees}°${minutes}'${seconds}"`
}

export const calculateAzimuth = (start: Coordinate, end: Coordinate): string => {
  const [lon1, lat1] = toLonLat(start)
  const [lon2, lat2] = toLonLat(end)

  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180))
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon)

  let brng = Math.atan2(y, x)
  brng = brng * (180 / Math.PI)
  brng = (brng + 360) % 360
  return toDegreesMinutesSeconds(brng)
}

export const calculateDistance = (start: Coordinate, end: Coordinate): number => {
  const [lon1, lat1] = toLonLat(start)
  const [lon2, lat2] = toLonLat(end)
  return getDistance([lon1, lat1], [lon2, lat2])
}

export const calculateAngle = (point1: Coordinate, point2: Coordinate, point3: Coordinate) => {
  const angle1 = Math.atan2(point2[1] - point1[1], point2[0] - point1[0])
  const angle2 = Math.atan2(point3[1] - point2[1], point3[0] - point2[0])
  let angle = ((angle2 - angle1) * 180) / Math.PI
  angle = Math.abs(angle)
  if (angle > 180) {
    angle = 360 - angle
  }
  return angle
}

export const convertDistanceToMiles = (distanceKm: number) => distanceKm * 0.621371
export const convertAngleToRadians = (angleDeg: number) => angleDeg * (Math.PI / 180)
