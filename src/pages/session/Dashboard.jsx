import { Card, Checkbox, Container, Flex, Grid, Text } from '@mantine/core'
import React from 'react'
import DashboardSettings from '../../components/DashboardSettings'
import LineChart from '../../components/LineChart'
import { Logo } from '../../components/Logo'
import Map from '../../components/Map'
import PacketList from '../../components/PacketList'
import Statistics from '../../components/Statistics'
import NetworkMap from '../../components/NetworkMap'
import WordCloud from '../../components/WordCloud'
import { useAtom, useAtomValue } from 'jotai'
import { activeViewAtom } from '../../state/app'
import IncomingOutgoingPackets from '../../components/IncomingOutgoingPackets'
import Hosts from '../../components/Hosts'
import { activePacketsToggleAtom } from '../../state/packets'

const ActivePacketsToggle = () => {
  const [checked, set] = useAtom(activePacketsToggleAtom)

  return (
    <Checkbox
      h={20}
      label="Only show active"
      checked={checked}
      onChange={(e) => set(e.currentTarget.checked)}
    />
  )
}

const TopRow = () => {
  return (
    <>
      <Grid.Col span={2}>
        <Card h="100%" style={{ overflow: 'visible' }}>
          <Flex h="100%" direction="column" gap="md">
            <Flex gap="xs" align="center" justify="center">
              <Logo small />
              <DashboardSettings />
            </Flex>
            <ActivePacketsToggle />
          </Flex>
        </Card>
      </Grid.Col>
      <Grid.Col span={7}>
        <Card h={'20vh'} p={0}>
          <LineChart />
        </Card>
      </Grid.Col>
      <Grid.Col span={3}>
        <Card h="100%">
          <WordCloud />
        </Card>
      </Grid.Col>
    </>
  )
}

const Dashboard = () => {
  const activeView = useAtomValue(activeViewAtom)

  return (
    <Grid columns={12} p="md" gutter="md" w="100%">
      <TopRow />
      <Grid.Col span={9}>
        {activeView === 'map' && <Map />}
        {activeView === 'hosts' && <Hosts />}
        {activeView === 'network-map' && <NetworkMap />}
      </Grid.Col>
      {activeView !== 'list' && (
        <Grid.Col span={3}>
          <Statistics />
          <Card mt="md" h="calc(100vh - 400px);" p="xs">
            <PacketList />
          </Card>
        </Grid.Col>
      )}
      {activeView === 'list' && (
        <Grid.Col span={12}>
          <IncomingOutgoingPackets />
        </Grid.Col>
      )}
    </Grid>
  )
}

export default React.memo(Dashboard)
