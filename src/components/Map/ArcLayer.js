import { ArcLayer } from '@deck.gl/layers'
import { useAtomValue } from 'jotai'
import { dataAtom, frameAtom } from '../../state/packets'
import { FPS, timeRangeForFrame } from '../../utils/remotion'

const multiplierForDistance = (distance) => {
  //   if (distance < 500) return 2
  if (distance < 1000) return 1.5
  if (distance < 2000) return 1.25
  return 1
}

const widthForZoom = (zoom) => {
  if (zoom > 5) return 8
  if (zoom > 3) return 3
  if (zoom > 2) return 4
  if (zoom > 1.5) return 5
  return 5
}

const heightForZoom = (zoom) => {
  //   if (zoom > 5) return 0.15
  //   if (zoom > 3) return 0.25
  //   if (zoom > 2) return 0.33
  return 0.5
}

const useArcLayer = (zoom) => {
  const data = useAtomValue(dataAtom)
  const frame = useAtomValue(frameAtom)

  return new ArcLayer({
    id: `routes`,
    data,
    visible: true,
    pickable: true,
    getSourcePosition: (d) => (d.dir === 'in' ? d.pos : d.clientPos),
    getTargetPosition: (d) => (d.dir === 'in' ? d.clientPos : d.pos),
    getSourceTimestamp: (d) => d.frame,
    getTargetTimestamp: (d) => d.frame + 3 * FPS,
    getTilt: (d) => 0,
    getHeight: (d) => heightForZoom(zoom) * multiplierForDistance(d.distance),
    getWidth: (d) => widthForZoom(zoom),
    timeRange: timeRangeForFrame(frame),
    getSourceColor: [167, 29, 49],
    getTargetColor: [167, 29, 49],
  })
}

export default useArcLayer
