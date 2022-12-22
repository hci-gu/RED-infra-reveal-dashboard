import { Card, Flex, Text } from '@mantine/core'
import { useAtomValue } from 'jotai'
import React from 'react'
import { clockAtom } from '../../state/packets'

const Clock = () => {
  const time = useAtomValue(clockAtom)

  return (
    <Card
      p={4}
      style={{
        position: 'absolute',
        zIndex: 1,
        top: 8,
        right: 8,
        fontSize: '2rem',
      }}
      withBorder
    >
      <Text size="1.25rem" h={16} mb={12}>
        {time.toLocaleTimeString()}
      </Text>
    </Card>
  )
}

export default Clock
