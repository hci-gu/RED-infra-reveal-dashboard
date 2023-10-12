import {
  COORDINATE_SYSTEM,
  _SunLight as SunLight,
  _CameraLight as CameraLight,
  AmbientLight,
  LightingEffect,
} from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import { SimpleMeshLayer } from '@deck.gl/mesh-layers'
import { SphereGeometry } from '@luma.gl/core'

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.4,
})
export const sunLight = new SunLight({
  // bright orange
  color: [235, 200, 185],
  // color: [255, 255, 255],
  intensity: 4.0,
  timestamp: 0,
})
const cameraLight = new CameraLight({
  color: [255, 255, 255],
  intensity: 2.0,
})

export const getInitialViewState = ({
  longitude = 11.91737,
  latitude = 57.69226,
}) => ({
  longitude,
  latitude,
  zoom: 1.5,
  minZoom: 0,
  maxZoom: 25,
  pitch: 40.5,
  bearing: 0,
})

const EARTH_RADIUS_METERS = 6.3e6

export const lightingEffect = (settings) => {
  if (!settings.cameraLight) {
    return new LightingEffect({
      ambientLight,
      sunLight,
    })
  }
  return new LightingEffect({
    ambientLight,
    sunLight,
    cameraLight,
  })
}

const urlForDetailLevel = (detailLevel = 2) => {
  switch (detailLevel) {
    case 0:
      return 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_0_countries.json'
    case 1:
      return 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json'
    case 2:
      return 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json'
    default:
      return 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json'
  }
}

const borderWidthForZoom = (baseWidth = 15000, zoom) => {
  if (zoom > 6) return baseWidth / 8
  if (zoom > 5) return baseWidth / 4
  if (zoom > 3) return baseWidth / 2
  return baseWidth
}

export const createGlobeLayers = (
  darkMode = true,
  { detailLevel = 1, borderWidth = 15000 },
  zoom
) => [
  new SimpleMeshLayer({
    id: 'earth-sphere',
    data: [0],
    mesh: new SphereGeometry({
      radius: EARTH_RADIUS_METERS,
      nlat: 18,
      nlong: 36,
    }),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: [0, 0, 0],
    getColor: darkMode ? [37, 38, 43] : [92, 122, 214],
    material: {
      ambient: 0.25,
      diffuse: 0.4,
      shininess: 400,
      specularColor: [51, 51, 51],
    },
  }),
  new GeoJsonLayer({
    id: 'earth-land',
    data: urlForDetailLevel(detailLevel),
    stroked: true,
    filled: true,
    opacity: 1,
    getFillColor: darkMode ? [175, 157, 160] : [51, 210, 90],
    getLineColor: [37, 38, 43],
    getLineWidth: borderWidthForZoom(borderWidth, zoom),
    // pointType: 'circle+text',
  }),
]
