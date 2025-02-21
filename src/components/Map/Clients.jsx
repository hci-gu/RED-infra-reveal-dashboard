import { Card, Chip, Flex } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { clientsAtom, selectedClientsAtom } from '../../state/packets'
import { colorForUserId, getClientColor } from '../../utils/color'

const Clients = () => {
  const clients = useAtomValue(clientsAtom)
  const [selectedClients, setSelected] = useAtom(selectedClientsAtom)

  return (
    <Flex
      direction="column"
      gap={4}
      style={{ position: 'absolute', zIndex: 1, right: 8, top: 54 }}
    >
      {clients.map((client, i) => (
        <Chip
          key={`Client_${client}`}
          checked={selectedClients.includes(client)}
          onChange={() =>
            setSelected(
              selectedClients.includes(client)
                ? selectedClients.filter((s) => s !== client)
                : [...selectedClients, client]
            )
          }
          size="xs"
        >{`Client ${i}`}</Chip>
      ))}
    </Flex>
  )
}

export default Clients
