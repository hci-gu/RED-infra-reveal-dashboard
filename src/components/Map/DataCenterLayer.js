import { IconLayer } from 'deck.gl'
import awsCoords from './geojson/aws.json'
import azureCoords from './geojson/azure.json'
import gcpCoords from './geojson/gcp.json'
import cloudflareCoords from './geojson/cloudflare.json'

const dataForSettings = (type) => {
  switch (type) {
    case 'aws':
      return awsCoords
    case 'azure':
      return azureCoords
    case 'cloudflare':
      return cloudflareCoords
    case 'gcp':
      return gcpCoords
    case 'all':
      return [...awsCoords, ...azureCoords, ...cloudflareCoords, ...gcpCoords]
    default:
      return []
  }
}

const colorForType = (type) => {
  switch (type) {
    case 'aws':
      return [255, 153, 0]
    case 'azure':
      return [0, 153, 255]
    case 'cloudflare':
      return [244, 129, 32]
    case 'gcp':
      return [219, 68, 55]
    default:
      return [255, 255, 255]
  }
}

const useDataCenterLayer = ({ globe, dataCenters }) => {
  return new IconLayer({
    data: dataForSettings(dataCenters),
    id: 'icon',
    getIcon: (_) => 'marker',
    getColor: (d) => colorForType(d.type),
    getPosition: (d) => d.coordinates,
    iconAtlas: '/img/icon-atlas.png',
    iconMapping: {
      aws: {
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false,
      },
      azure: {
        x: 128,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false,
      },
      gcp: {
        x: 0,
        y: 128,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false,
      },
      cloudflare: {
        x: 128,
        y: 128,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false,
      },
    },
    billboard: !globe,
    sizeScale: 0.5,
    getAngle: (_) => (globe ? 180 : 0),
    getSize: (d) => 60,
    getIcon: (d) => d.type,
  })
}

export default useDataCenterLayer
