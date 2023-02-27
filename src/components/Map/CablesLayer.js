import { GeoJsonLayer } from 'deck.gl'
import cables from './geojson/cables.json'

const hexToRgb = (hex) => {
  const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return [
    parseInt(parts[1], 16),
    parseInt(parts[2], 16),
    parseInt(parts[3], 16),
  ]
}

const useCablesLayer = () => {
  return new GeoJsonLayer({
    id: 'geojson',
    data: cables.features,
    stroked: false,
    filled: false,
    lineWidthMinPixels: 1,
    parameters: {
      depthTest: true,
    },
    getLineColor: (f) => hexToRgb(f.properties.color),
    pickable: true,
    // onHover: setHoverInfo,

    transitions: {
      getLineColor: 1000,
      getLineWidth: 1000,
    },
  })
}

export default useCablesLayer
