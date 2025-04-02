import { ArcLayer } from '@deck.gl/layers'
import { useAtomValue } from 'jotai'
import { selectedDataAtom } from '../../state/packets'

const heightForZoom = (zoom) => {
  if (zoom > 5) return 0.15
  if (zoom > 3) return 0.25
  if (zoom > 2) return 0.33
  return 0.5
}

const useArcLayer = (zoom) => {
  const data = useAtomValue(selectedDataAtom)

  return new ArcLayer({
    id: `routes`,
    data,
    visible: true,
    pickable: true,
    getSourcePosition: (d) => d.startPos,
    getTargetPosition: (d) => d.endPos,
    getTilt: (d) => 0,
    getHeight: (d) => heightForZoom(zoom),
    getWidth: (d) => 1,
    getSourceColor: [60, 60, 60],
    getTargetColor: [60, 60, 60],
  })
}

export default useArcLayer
