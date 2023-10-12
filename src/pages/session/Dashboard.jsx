import { Card, Container, Flex, Grid } from '@mantine/core'
import React from 'react'
import DashboardSettings from '../../components/DashboardSettings'
import LineChart from '../../components/LineChart'
import { Logo } from '../../components/Logo'
import Map from '../../components/Map'
import PacketList from '../../components/PacketList'
import PieChart from '../../components/PieChart'
import CategorySelect from '../../components/PieChart/CategorySelect'
import Statistics from '../../components/Statistics'
import TagSelect from '../../components/TagSelect'
import WordCloud from '../../components/WordCloud'

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
            <TagSelect />
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
  return (
    <Grid columns={12} p="md" gutter="md" w="100%">
      <TopRow />
      <Grid.Col span={9}>
        <Map />
      </Grid.Col>
      <Grid.Col span={3}>
        <Statistics />
        <Card mt="md" h={'calc(25vh + 80px);'}>
          <Flex direction="column" gap="xs">
            <CategorySelect />
            <Container w="100%" h={'25vh'}>
              <PieChart />
            </Container>
          </Flex>
        </Card>
        <Card mt="md" h="calc(100vh - 640px);" p="xs">
          <PacketList />
        </Card>
      </Grid.Col>
    </Grid>
  )
}

export default React.memo(Dashboard)
