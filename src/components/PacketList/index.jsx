import { ScrollArea, Table } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { filteredPacketsAtom, selectedPacketAtom } from '../../state/packets'
import { displayBytes } from '../../utils/data'
import { IconCircle } from '@tabler/icons'

export const PacketListComponent = ({ packets }) => {
  const [selected, select] = useAtom(selectedPacketAtom)

  return (
    <ScrollArea style={{ height: '100%' }}>
      <Table
        fontSize="xs"
        verticalSpacing={4}
        horizontalSpacing={4}
        striped
        withColumnBorders
      >
        <thead>
          <tr>
            <th></th>
            <th>Host</th>
            <th>time</th>
            <th>IN</th>
            <th>OUT</th>
          </tr>
        </thead>
        <tbody>
          {packets
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 25)
            .map((packet) => (
              <tr
                key={packet.id}
                onClick={() => {
                  select(selected?.id == packet.id ? null : packet)
                }}
                style={{
                  cursor: 'pointer',
                  background:
                    packet.id == selected?.id ? 'rgba(0, 0, 0, 0.5)' : null,
                }}
              >
                <td style={{ width: 10 }}>
                  <IconCircle
                    style={{
                      width: 8,
                      height: 8,
                      color: packet.active ? 'lime' : 'red',
                    }}
                  />
                </td>
                <td style={{ overflowX: 'hidden' }}>{packet.host}</td>
                {/* <td>{packet.city ?? '-'}</td> */}
                <td>{packet.timestamp.toLocaleTimeString()}</td>
                <td>{displayBytes(packet.incomingBytes)}</td>
                <td>{displayBytes(packet.incomingBytes)}</td>
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
