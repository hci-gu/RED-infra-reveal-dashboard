import { Checkbox, Flex, Popover, Select, Slider, Text } from '@mantine/core'
import { IconSettings } from '@tabler/icons'
import { useAtom, useAtomValue } from 'jotai'
import React, { useState, forwardRef } from 'react'
import {
  activeViewAtom,
  darkModeAtom,
  playbackRateAtom,
  settingsOpenedAtom,
} from '../../state/app'
import { availableDataCenters, mapSettingsAtom } from '../../state/map'

const marks = [
  { value: 0.5, label: '50%' },
  { value: 1, label: '100%' },
  { value: 4, label: '400%' },
]
const PlayBackRate = () => {
  const [rate, setRate] = useAtom(playbackRateAtom)

  return (
    <Slider
      label="Playback Rate"
      w={200}
      marks={marks}
      value={rate}
      onChange={(value) => setRate(value)}
      min={0.1}
      step={0.1}
      max={4}
      thumbSize={14}
      styles={() => ({
        markLabel: {
          fontSize: 9,
        },
      })}
    />
  )
}

const GlobeMapBorder = () => {
  const [settings, set] = useAtom(mapSettingsAtom)

  if (!settings.globe) return null

  return (
    <Slider
      label="Border width"
      w={200}
      value={settings.borderWidth}
      onChange={(value) => set({ borderWidth: value })}
      min={1000}
      step={500}
      max={100000}
      thumbSize={14}
      styles={() => ({
        markLabel: {
          fontSize: 9,
        },
      })}
    />
  )
}

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom)
  return (
    <Checkbox
      label="Dark Mode"
      checked={darkMode}
      onChange={(e) => setDarkMode(e.currentTarget.checked)}
    />
  )
}

const Toggle = ({ field, label }) => {
  const [settings, set] = useAtom(mapSettingsAtom)
  return (
    <Checkbox
      label={label}
      checked={settings[field]}
      onChange={(e) => set({ [field]: e.currentTarget.checked })}
    />
  )
}

const ActiveViewSelect = () => {
  const [activeView, set] = useAtom(activeViewAtom)

  return (
    <Select
      label="Active view"
      data={[
        { label: 'Map', value: 'map' },
        { label: 'List', value: 'list' },
        { label: 'Hosts', value: 'hosts' },
        { label: 'Traceroutes', value: 'network-map' },
      ]}
      value={activeView}
      onChange={(value) => set(value)}
    />
  )
}

const MapDetailSelect = () => {
  const [{ detailLevel }, set] = useAtom(mapSettingsAtom)

  return (
    <Select
      label="Map Detail"
      data={[
        { label: 'Low', value: 2 },
        { label: 'Medium', value: 1 },
        { label: 'High', value: 0 },
      ]}
      value={detailLevel}
      onChange={(value) => set({ detailLevel: value })}
    />
  )
}

const MapProjectionSelect = () => {
  const [{ projection, globe }, set] = useAtom(mapSettingsAtom)

  if (globe) return null

  return (
    <Select
      label="Map projection"
      data={[
        { label: 'Mercator', value: 'mercator' },
        { label: 'Equal Earth', value: 'equalEarth' },
        { label: 'Natural Earth', value: 'naturalEarth' },
        { label: 'Winkel Tripel', value: 'winkelTripel' },
        { label: 'Equirectangular', value: 'equirectangular' },
      ]}
      value={projection}
      onChange={(value) => set({ projection: value })}
    />
  )
}

const DataCenterSelect = () => {
  const [{ dataCenters }, set] = useAtom(mapSettingsAtom)

  return (
    <Select
      label="Datacenters (Edge locations)"
      data={availableDataCenters}
      value={dataCenters}
      onChange={(value) => set({ dataCenters: value })}
      placeholder="Select datacenters"
      clearable
    />
  )
}

const OpenDashboardSettingsButton = forwardRef((props, ref) => {
  return (
    <div ref={ref} style={{ position: 'relative', width: 25 }}>
      <IconSettings
        style={{ position: 'absolute', marginTop: -12 }}
        onClick={props.setOpened}
        sx={() => ({
          '@media (min-width: 1600px)': {
            width: 50,
            height: 50,
          },
        })}
      />
    </div>
  )
})

const DashboardSettings = () => {
  const [opened, setOpened] = useAtom(settingsOpenedAtom)

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      width={400}
      withArrow
      shadow="md"
    >
      <Popover.Target>
        <OpenDashboardSettingsButton setOpened={() => setOpened(!opened)} />
      </Popover.Target>
      <Popover.Dropdown p="sm">
        <Flex direction="column" gap="xs">
          <h3 style={{ margin: 0 }}>Settings</h3>
          <ActiveViewSelect />
          <Flex w="100%" gap="xs">
            <DarkModeToggle />
            <PlayBackRate />
          </Flex>
          <Flex gap="xs">
            <Toggle field="globe" label="Globe" />
            <Toggle field="cameraLight" label="Camera Light" />
          </Flex>
          <GlobeMapBorder />
          <MapProjectionSelect />
          <MapDetailSelect />
          <DataCenterSelect />
          <Toggle field="cables" label="Cables" />
        </Flex>
      </Popover.Dropdown>
    </Popover>
  )
}

export default DashboardSettings
