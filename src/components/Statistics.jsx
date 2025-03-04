import { Grid, Card, Stack, Text } from '@mantine/core'
import React from 'react'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom, packetContentSizeAtom } from '../state/packets'
import { displayBytes } from '../utils/data'


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
