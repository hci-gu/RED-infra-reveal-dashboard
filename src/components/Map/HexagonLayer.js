import { HexagonLayer } from 'deck.gl'
import { MaskExtension } from '@deck.gl/extensions'

const material = {
  ambient: 0.64,
  diffuse: 0.5,
  shininess: 1000,
  specularColor: [51, 51, 51],
}

const colorRange = [
  [167, 29, 49],
  [191, 56, 47],
  [212, 82, 42],
  [230, 109, 34],
  [245, 137, 22],
  [255, 166, 0],
].reverse()

const upperPercentile = 100
const coverage = 1

const radiusForZoom = (zoom, globe) => {
  const multi = globe ? 1 : 2
  if (zoom > 8) return 1000
  if (zoom > 6.5) return 5000
  if (zoom > 5) return 10000 * multi
  if (zoom > 3) return 15000 * multi
  if (zoom > 2) return 30000 * multi
  if (zoom > 1.5) return 50000 * multi
  return 100000 * multi
}

const elevationRangeForZoom = (zoom) => {
  if (zoom > 8) return [100, 1000]
  if (zoom > 6.5) return [100, 2000]
  if (zoom > 5) return [100, 3000]
  if (zoom > 3) return [100, 5000]
  if (zoom > 2) return [100, 7500]
  if (zoom > 1.5) return [1000, 15000]
  return [2500, 30000]
}

const useHexagonLayer = (
  packets,
  zoom = 1,
  globe = false,
  onClick = () => {}
) => {
  return new HexagonLayer({
    id: 'heatmap',
    colorRange,
    coverage,
    data: packets.map((p) => [p.pos[0], p.pos[1], 0]),
    elevationRange: elevationRangeForZoom(zoom),
    // extensions: [new MaskExtension()],
    // maskId: 'geofence',
    // elevationDomain: [0, 100],
    elevationScale: 50,
    extruded: true,
    getPosition: (d) => d,
    onClick,
    pickable: true,
    radius: radiusForZoom(zoom, globe),
    upperPercentile,
    material,
  })
}

export default useHexagonLayer
