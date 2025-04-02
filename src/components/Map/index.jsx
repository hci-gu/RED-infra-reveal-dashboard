import React, { use, useCallback, useEffect, useMemo, useState } from 'react'
import { DeckGL } from 'deck.gl'
import { FlyToInterpolator, _GlobeView as GlobeView } from '@deck.gl/core'
import {
  createGlobeLayers,
  getInitialViewState,
  lightingEffect,
  sunLight,
} from './constants'
import { useAtomValue } from 'jotai'
import {
  dataAtom,
  dataForPacket,
  filteredPacketsAtom,
  selectedPacketAtom,
} from '../../state/packets'
import { Card } from '@mantine/core'
import useHexagonLayer from './HexagonLayer'
import useAnimatedArcLayer from './AnimatedArcLayer'
import { mapSettingsAtom } from '../../state/map'
import BackgroundMap from './BackgroundMap'
import {
  darkModeAtom,
  followModeAtom,
  onlyShowSelectedAtom,
} from '../../state/app'
import { useViewportSize } from '@mantine/hooks'
import useDataCenterLayer from './DataCenterLayer'
import LayerToggles from './LayerToggles'
import Clock from './Clock'
import useCablesLayer from './CablesLayer'
import { sessionAtom } from '../../state/sessions'
import { MemoizedWordCloud } from '../WordCloud'
import Clients from './Clients'
import useArcLayer from './ArcLayer'
import { useCurrentFrame } from 'remotion'
import {
  hopPositionAtFrame,
  isSamePosition,
  positionAtFrame,
} from '../../utils/geo'
import { FPS } from '../../utils/remotion'

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
  return matchingPacket.country
}

const packetsForPoints = (points, packets) => {
  const uniquePoints = new Set(
    points.map((p) => `${p.source[0]}${p.source[1]}`)
  )
  return packets.filter((p) => uniquePoints.has(`${p.pos[0]}${p.pos[1]}`))
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

const FollowCamera = ({ viewState, setViewState }) => {
  const selectedPacket = useAtomValue(selectedPacketAtom)
  const [flyTo, setFlyTo] = useState(null)
  const followMode = useAtomValue(followModeAtom)
  const [position, setPosition] = useState(null)
  const frame = useCurrentFrame()

  const flyToLocation = useCallback(({ latitude, longitude, zoom }) => {
    setViewState({
      latitude,
      longitude,
      zoom,
      pitch: 40.5,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }, [])

  useEffect(() => {
    if (position) {
      flyToLocation({
        ...position,
        zoom: 6,
      })
    }
  }, [position])

  useEffect(() => {
    if (!selectedPacket || !followMode) return

    const pos = hopPositionAtFrame(
      dataForPacket(selectedPacket),
      frame + FPS / 2
    )
    if (!position || (pos && !isSamePosition(pos, position))) {
      setPosition(pos)
    }
  }, [position, selectedPacket, followMode, frame])

  // useEffect(() => {
  //   if (!flyTo) return

  //   flyToLocation(flyTo)
  // }, [flyTo])

  // useEffect(() => {
  //   if (!selectedPacket) {
  //     flyToLocation(getInitialViewState({}))
  //     return
  //   }

  //   flyToLocation({
  //     latitude: selectedPacket.pos[1],
  //     longitude: selectedPacket.pos[0],
  //     zoom: 8,
  //   })
  // }, [selectedPacket])

  return null
}

export const Map = () => {
  const session = useAtomValue(sessionAtom)
  const [viewState, setViewState] = useState(
    getInitialViewState({
      latitude: session?.lat,
      longitude: session?.lon,
    })
  )
  const selectedPacket = useAtomValue(selectedPacketAtom)
  const onlyShowSelected = useAtomValue(onlyShowSelectedAtom)
  const followMode = useAtomValue(followModeAtom)
  const { height } = useViewportSize()
  const [heatmapInfo, setHeatMapInfo] = useState(null)
  const [zoom, setZoom] = useState(0)
  const darkMode = useAtomValue(darkModeAtom)
  const settings = useAtomValue(mapSettingsAtom)
  let packets = useAtomValue(filteredPacketsAtom)
  let data = useAtomValue(dataAtom)
  const globeLayers = useMemo(
    () => createGlobeLayers(darkMode, settings, zoom),
    [darkMode, settings, zoom]
  )

  if (onlyShowSelected && selectedPacket) {
    data = dataForPacket(selectedPacket)
    packets = packets.filter((p) => p.id === selectedPacket.id)
  }

  const hexagonLayer = useHexagonLayer(
    packets,
    zoom,
    settings.globe,
    (info) => {
      if (
        info.object.position[0] == heatmapInfo?.object.position[0] &&
        info.object.position[1] == heatmapInfo?.object.position[1]
      ) {
        return setHeatMapInfo(null)
      }
      setHeatMapInfo(info)
    }
  )
  const animatedArcLayer = useAnimatedArcLayer(data, zoom)
  const arcLayer = useArcLayer(zoom)
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
      {followMode && (
        <FollowCamera viewState={viewState} setViewState={setViewState} />
      )}
      <LayerToggles />
      <Clients />
      <Clock />
      <DeckGL
        views={settings.globe ? new GlobeView() : null}
        controller
        layers={[
          ...(settings.globe ? globeLayers : []),
          settings.heatmap ? hexagonLayer : null,
          settings.packets ? animatedArcLayer : null,
          settings.packets ? arcLayer : null,
          settings.cables ? cablesLayer : null,
          dataCenterLayer,
        ]}
        effects={[lightingEffect(settings)]}
        viewState={viewState}
        getTooltip={(t) => getTooltip(t, packets)}
        onViewStateChange={({ viewState }) => {
          setZoom(viewState.zoom)
          setViewState(viewState)
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
        {heatmapInfo?.object && (
          <div
            style={{
              position: 'absolute',
              zIndex: 100,
              pointerEvents: 'none',
              left: heatmapInfo.x,
              top: heatmapInfo.y,
              background: darkMode
                ? 'rgba(0,0,0,0.8)'
                : 'rgba(255,255,255,0.9)',
              borderRadius: '16px',
            }}
          >
            <MemoizedWordCloud
              width={480}
              height={360}
              packets={packetsForPoints(heatmapInfo.object.points, packets)}
            />
          </div>
        )}
      </DeckGL>
    </Card>
  )
}

export default Map
