import { ScrollArea, Table } from '@mantine/core'
import { useAtomValue } from 'jotai'
import React from 'react'
import { filteredPacketsAtom } from '../../state/packets'

const PacketListComponent = ({ packets }) => {
  return (
    <ScrollArea style={{ height: '100%' }}>
      <Table fontSize="xs" verticalSpacing={4} horizontalSpacing={0}>
        <thead>
          <tr>
            <th>Host</th>
            <th>City</th>
            <th>a</th>
          </tr>
        </thead>
        <tbody>
          {packets
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 25)
            .map((packet) => (
              <tr key={packet.id}>
                <td>{packet.host}</td>
                <td>{packet.city ?? '-'}</td>
                <td>{packet.timestamp.toLocaleTimeString()}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </ScrollArea>
  )
}

const MemoizedPacketList = React.memo(PacketListComponent, (prev, next) => {
  return prev.packets.length === next.packets.length
})

export default function PacketList() {
  const packets = useAtomValue(filteredPacketsAtom)

  return <MemoizedPacketList packets={packets} />
}
