import { Anchor, Flex } from '@mantine/core'
import React from 'react'
import { useSessions } from '../hooks/api'

const durationFor = (start, end) => {
  const duration = new Date(end) - new Date(start)
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  return `${hours}h ${minutes}m ${seconds}s`
}

const Index = () => {
  const sessions = useSessions()

  return (
    <div>
      <h1>Sessions</h1>
      <Flex direction="column">
        {sessions.map((session) => (
          <Anchor key={session.id} href={`/session/${session.id}`}>
            Session: {session.id}, {durationFor(session.start, session.end)}
          </Anchor>
        ))}
      </Flex>
    </div>
  )
}

export default Index
