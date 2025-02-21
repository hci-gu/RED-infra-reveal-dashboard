import { atom } from 'jotai'

export const availableDataCenters = [
  { label: 'All', value: 'all' },
  { label: 'Amazon AWS', value: 'aws' },
  { label: 'Microsoft Azure', value: 'azure' },
  { label: 'Google cloud', value: 'gcp' },
  { label: 'Cloudflare', value: 'cloudflare' },
]

export const mapSettingsAtom = atom(
  {
    globe: false,
    projection: 'mercator',
    detailLevel: 1,
    dataCenters: null,
    heatmap: true,
    packets: true,
    activePackets: true,
    cameraLight: true,
    cables: false,
    borderWidth: 15000,
  },
  (get, set, update) => {
    set(mapSettingsAtom, {
      ...get(mapSettingsAtom),
      ...update,
    })
  }
)
