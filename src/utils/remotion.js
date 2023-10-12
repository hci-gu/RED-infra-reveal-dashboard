export const FPS = 30
export const frameDuration = 1000 / FPS

export const packetsToFrameDuration = (packets, live = false) => {
  if (!packets.length) return FPS

  if (live) {
    const minDate = Math.min(...packets.map((p) => p.timestamp))
    const frames = frameForDate(minDate, new Date())
    return Math.max(frames + FPS * 5, FPS * 5)
  }
  return Math.max(...packets.map((p) => p.endFrame))
}

export const dateForFrame = (start, frame) => {
  const date = new Date(start)
  date.setSeconds(date.getSeconds() + frame / FPS)
  return date
}

export const frameForDate = (start, date) => {
  return Math.floor((date - start) / frameDuration)
}

export const timeRangeForFrame = (frame) => {
  return [frame, frame + FPS / 4]
}
