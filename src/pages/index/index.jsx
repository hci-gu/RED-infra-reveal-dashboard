import { Anchor, Flex } from '@mantine/core'
import React from 'react'
import { useSessions } from '../../hooks/api'
import { RichText } from 'prismic-reactjs'

import styled from '@emotion/styled'
import { useAtomValue } from 'jotai'
import { cmsContentAtom } from '../../state/app'
import { mobile } from '../../utils/layout'
import Sections from './Sections'
import Concepts from './Concepts'
import Globe from './Globe'
import SessionList from './SessionList'
import { Logo } from '../../components/Logo'
import LanguageSelect from '../../components/LanguageSelect'

const Container = styled.div`
  background-color: #0d0d0d;
  margin: 0;
`

const TopSection = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  ${mobile()} {
    grid-template-columns: 1fr;
  }
  overflow: hidden;
`

const Content = styled.div`
  border-top: 2px solid #a71d31;
  position: relative;
  z-index: 100;
  width: 100%;
  min-height: 50vh;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  > div {
    margin: 0 auto;
    width: 60%;
  }
  ${mobile()} {
    > div {
      width: 90%;
    }
  }
`

const GlobeContainer = styled.div`
  pointer-events: none;
  ${mobile()} {
    display: none;
  }
`

const AboutContainer = styled.div`
  z-index: 2;
  width: 90%;
  margin: 0 auto;
  > h1 {
    margin: 0 8px;
    font-family: 'Josefin Sans', sans-serif;
    font-weight: 200;
    font-size: 24px;
  }
  > p {
    font-size: 14px;
  }
  ${mobile()} {
    > h1 {
      margin: 0;
      font-size: 16px;
      text-align: center;
    }
  }
`

const About = ({ title, description }) => {
  return (
    <AboutContainer>
      <RichText render={title} />
    </AboutContainer>
  )
}

const Index = () => {
  const { landing } = useAtomValue(cmsContentAtom)

  return (
    <Container>
      <Logo style={{ margin: '0px auto', marginTop: '30px', width: '89%' }} />
      <LanguageSelect />
      {landing && (
        <About title={landing.title} description={landing.description} />
      )}
      <TopSection>
        <GlobeContainer>
          <Globe />
        </GlobeContainer>
        <SessionList title={landing ? landing.sessions_title : ''} />
      </TopSection>
      <Content>
        {landing && <Sections sections={landing.sections} />}
        {landing && (
          <Concepts
            title={landing.concepts_header}
            concepts={landing.concepts}
          />
        )}
      </Content>
    </Container>
  )
}

export default Index
