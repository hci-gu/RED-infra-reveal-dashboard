import React from 'react'
import { Card, Grid, Text } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { PacketListComponent } from '../PacketList'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom } from '../../state/packets'

const IncomingOutgoingPacketsComp = ({ packets }) => {
  const { height } = useViewportSize()
  const outgoing = packets.filter((p) => p.direction === 'outgoing')
  const incoming = packets.filter((p) => p.direction === 'incoming')

  return (
    <Card style={{ height: height - 225 }}>
      <Grid columns={2}>
        <Grid.Col span={1}>
          <Text align="center" weight={700} size="xl">
            Incoming
          </Text>
          <PacketListComponent packets={incoming} />
        </Grid.Col>
        <Grid.Col span={1}>
          <Text align="center" weight={700} size="xl">
            Outgoing
          </Text>
          <PacketListComponent packets={outgoing} />
        </Grid.Col>
      </Grid>
    </Card>
  )
}

const MemoizedIncomingOutgoingPackets = React.memo(
  IncomingOutgoingPacketsComp,
  (prev, next) => {
    return prev.packets.length === next.packets.length
  }
)

export default function IncomingOutgoingPackets() {
  const packets = useAtomValue(filteredPacketsAtom)

  return <MemoizedIncomingOutgoingPackets packets={packets} />
}
