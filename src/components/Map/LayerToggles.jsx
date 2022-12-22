import { Card, Checkbox, Flex } from '@mantine/core'
import { useAtom } from 'jotai'
import React from 'react'
import { mapSettingsAtom } from '../../state/map'

const HeatmapToggle = () => {
  const [{ heatmap }, set] = useAtom(mapSettingsAtom)

  return (
    <Checkbox
      h={20}
      label="Heatmap"
      checked={heatmap}
      onChange={(e) => set({ heatmap: e.currentTarget.checked })}
    />
  )
}

const PacketsToggle = () => {
  const [{ packets }, set] = useAtom(mapSettingsAtom)

  return (
    <Checkbox
      h={20}
      label="Packets"
      checked={packets}
      onChange={(e) => set({ packets: e.currentTarget.checked })}
    />
  )
}

const LayerToggles = () => {
  return (
    <Card style={{ position: 'absolute', zIndex: 1 }} withBorder>
      <Flex justify="center" align="center" gap="xs">
        <HeatmapToggle />
        <PacketsToggle />
      </Flex>
    </Card>
  )
}

export default LayerToggles
