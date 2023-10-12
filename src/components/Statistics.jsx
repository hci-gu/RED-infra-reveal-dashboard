import { Grid, Card, Stack, Text } from '@mantine/core'
import React from 'react'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom, packetContentSizeAtom } from '../state/packets'

// return `X Gb, Y Mb, Z Kb` from bytes
export function displayBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(2)} Kb`
  } else if (bytes < 1073741824) {
    return `${(bytes / 1048576).toFixed(2)} Mb`
  } else {
    return `${(bytes / 1073741824).toFixed(2)} Gb`
  }
}

const Statistics = () => {
  const totalContentSize = useAtomValue(packetContentSizeAtom)
  const packets = useAtomValue(filteredPacketsAtom)

  const responseTime =
    packets.reduce((acc, curr) => {
      if (curr.responseTime) {
        return acc + curr.responseTime
      }
      return acc
    }, 0) / packets.length

  const averageDistance =
    packets.reduce((acc, curr) => {
      if (curr.distance) {
        return acc + curr.distance
      }
      return acc
    }, 0) / packets.length

  return (
    <Card shadow="sm" mah={200}>
      <Grid align="center">
        <Grid.Col span={3}>
          <Stack p={0} spacing={0}>
            <Text align="center" size="xs">
              Number of packets
            </Text>
            <Text align="center" size="xl">
              {packets.length}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack p={0} spacing={0}>
            <Text align="center" size="xs">
              Data amount
            </Text>
            <Text align="center" size="xl">
              {displayBytes(totalContentSize)}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack p={0} spacing={0}>
            <Text align="center" size="xs">
              Average response time
            </Text>
            <Text align="center" size="xl">{`${responseTime.toFixed(
              1
            )} ms`}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack p={0} spacing={0}>
            <Text align="center" size="xs">
              Average distance
            </Text>
            <Text align="center" size="xl">{`${averageDistance.toFixed(
              0
            )} km`}</Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  )
}

export default Statistics
