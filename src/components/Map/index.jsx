import React, { useMemo, useState } from 'react'
import { DeckGL } from 'deck.gl'
import { _GlobeView as GlobeView } from '@deck.gl/core'
import {
  createGlobeLayers,
  INITIAL_VIEW_STATE,
  lightingEffect,
  sunLight,
} from './constants'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom } from '../../state/packets'
import { Card } from '@mantine/core'
import useHexagonLayer from './HexagonLayer'
import useAnimatedArcLayer from './AnimatedArcLayer'
import { mapSettingsAtom } from '../../state/map'
import BackgroundMap from './BackgroundMap'
import { darkModeAtom } from '../../state/app'
import { useViewportSize } from '@mantine/hooks'
import useDataCenterLayer from './DataCenterLayer'
import LayerToggles from './LayerToggles'
import Clock from './Clock'
import useCablesLayer from './CablesLayer'

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

const cityForPointsAndPackets = (points, packets) => {
  if (!points || !packets) return null
  const uniquePoints = new Set(
    points.map((p) => `${p.source[0]}${p.source[1]}`)
  )
  const matchingPacket = packets.find((p) =>
    uniquePoints.has(`${p.pos[0]}${p.pos[1]}`)
  )
  if (!matchingPacket) return null
  if (matchingPacket.city) return matchingPacket.city
  return regionNames.of(matchingPacket.country)
}

function getTooltip({ layer, object }, packets) {
  if (!object) return null

  if (layer.id === 'heatmap') {
    return `${object.points.length} Packets\n${cityForPointsAndPackets(
      object.points,
      packets
    )}`
  }
  if (layer.id === 'packets') {
    return `${object.method} ${object.host}`
  }
}

export const Map = () => {
  const { height } = useViewportSize()
  const [zoom, setZoom] = useState(0)
  const darkMode = useAtomValue(darkModeAtom)
  const settings = useAtomValue(mapSettingsAtom)
  const packets = useAtomValue(filteredPacketsAtom)
  const globeLayers = useMemo(
    () => createGlobeLayers(darkMode, settings, zoom),
    [darkMode, settings, zoom]
  )

  const hexagonLayer = useHexagonLayer(packets, zoom, settings.globe)
  const arcLayer = useAnimatedArcLayer(zoom)
  const dataCenterLayer = useDataCenterLayer(settings)
  const cablesLayer = useCablesLayer()

  const maxDate = new Date(Math.max(...packets.map((p) => p.timestamp)))
  sunLight.timestamp = maxDate.getTime()

  return (
    <Card
      radius="md"
      style={{
        width: '100%',
        height: height - 210,
        position: 'relative',
      }}
    >
      <LayerToggles />
      {/* <Clients /> */}
      <Clock />
      <DeckGL
        views={settings.globe ? new GlobeView() : null}
        controller
        layers={[
          ...(settings.globe ? globeLayers : []),
          settings.heatmap ? hexagonLayer : null,
          settings.packets ? arcLayer : null,
          settings.cables ? cablesLayer : null,
          dataCenterLayer,
        ]}
        effects={[lightingEffect(settings)]}
        initialViewState={INITIAL_VIEW_STATE}
        getTooltip={(t) => getTooltip(t, packets)}
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom)
        }}
      >
        {({ viewState, width, height }) => (
          <BackgroundMap
            viewState={viewState}
            width={width}
            height={height}
            style={{ zIndex: -1 }}
          />
        )}
      </DeckGL>
    </Card>
  )
}

export default Map
