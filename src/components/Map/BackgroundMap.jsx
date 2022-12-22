import { useAtomValue } from 'jotai'
import React from 'react'
import Map from 'react-map-gl'
import { darkModeAtom } from '../../state/app'
import { mapSettingsAtom } from '../../state/map'
const MAP_STYLE = 'mapbox://styles/sebastianait/clbxodlx5001a14prnbu9sgcs'
//const MAP_STYLE_DARK =
// ;('https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json')
const MAP_STYLE_DARK = 'mapbox://styles/sebastianait/clbdo99b1001x14o375tzl3ez'

const BackgroundMap = ({ viewState, width, height, style }) => {
  const darkMode = useAtomValue(darkModeAtom)
  const settings = useAtomValue(mapSettingsAtom)

  if (settings.globe) return null

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      projection={settings.projection}
      reuseMaps
      viewState={viewState}
      width={width}
      height={height}
      style={style}
      mapStyle={darkMode ? MAP_STYLE_DARK : MAP_STYLE}
      preventStyleDiffing={true}
      fog={{
        range: [0.1, 3],
        color: darkMode ? '#25262b' : '#cbe1e4',
      }}
    />
  )
}

export default BackgroundMap
