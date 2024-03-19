import { Anchor, AppShell, Flex, Text } from '@mantine/core'
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import Index from './pages/index'
import Session from './pages/session'

const Header = () => {
  return (
    <Flex p="xs" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.25)' }}>
      <Anchor href="/">RED</Anchor>
    </Flex>
  )
}

const App = () => {
  console.log('APP')
  return (
    <AppShell padding={0}>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Index />} /> */}
          <Route path="/session/:id" element={<Session />} />
        </Routes>
      </Router>
    </AppShell>
  )
}

export default App
