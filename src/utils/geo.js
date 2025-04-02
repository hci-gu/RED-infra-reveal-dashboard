export function isSamePosition(a, b) {
  return a.latitude === b.latitude && a.longitude === b.longitude
}

export function hopPositionAtFrame(hops, currentFrame) {
  for (let hop of hops) {
    if (currentFrame >= hop.frame && currentFrame <= hop.endFrame) {
      return {
        longitude: hop.endPos[0],
        latitude: hop.endPos[1],
      }
    }
  }

  if (hops.length && currentFrame < hops[0].frame) {
    return {
      latitude: hops[0].startPos[1],
      longitude: hops[0].startPos[0],
    }
  }
  if (hops.length && currentFrame > hops[hops.length - 1].endFrame) {
    const last = hops[hops.length - 1]
    return { latitude: last.endPos[1], longitude: last.endPos[0] }
  }

  return null
}

export function positionAtFrame(segments, currentFrame) {
  // Find the segment where currentFrame lies between its frame and endFrame
  for (let segment of segments) {
    if (currentFrame >= segment.frame && currentFrame <= segment.endFrame) {
      const progress =
        (currentFrame - segment.frame) / (segment.endFrame - segment.frame)
      // Note: startPos and endPos are assumed to be arrays [lon, lat]
      const startPos = segment.startPos
      const endPos = segment.endPos
      const currentLon = startPos[0] + progress * (endPos[0] - startPos[0])
      const currentLat = startPos[1] + progress * (endPos[1] - startPos[1])
      return { latitude: currentLat, longitude: currentLon }
    }
  }

  // If the frame is before the first segment, return the first startPos.
  if (segments.length && currentFrame < segments[0].frame) {
    return {
      latitude: segments[0].startPos[1],
      longitude: segments[0].startPos[0],
    }
  }
  // If the frame is after the last segment, return the last endPos.
  if (
    segments.length &&
    currentFrame > segments[segments.length - 1].endFrame
  ) {
    const last = segments[segments.length - 1]
    return { latitude: last.endPos[1], longitude: last.endPos[0] }
  }

  // If no segments available or no matching segment is found.
  return null
}
