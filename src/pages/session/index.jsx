import { ActionIcon, Button, Flex, LoadingOverlay, Text } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { Player } from '@remotion/player'
import { IconPlayerPause, IconPlayerPlay, IconPoint } from '@tabler/icons'
import { useAtom, useAtomValue } from 'jotai'
import React, { useCallback, useEffect, useRef } from 'react'
import { useCurrentFrame } from 'remotion'
import { useCategoriesAndTags, usePackets, useSession } from '../../hooks/api'
import { useSocket } from '../../hooks/socket'
import { playbackRateAtom } from '../../state/app'
import { frameAtom, mapPackets, packetsAtom } from '../../state/packets'
import { FPS, packetsToFrameDuration } from '../../utils/remotion'
import Dashboard from './Dashboard'

const InitPackets = ({ session, packets }) => {
  const [, setPackets] = useAtom(packetsAtom)
  useEffect(() => {
    setPackets(mapPackets(session, packets))
  }, [packets])

  return <></>
}

const FrameSetter = () => {
  const [, setFrame] = useAtom(frameAtom)
  const currentFrame = useCurrentFrame()

  useEffect(() => {
    setFrame(currentFrame)
  }, [currentFrame])

  return <></>
}

const SocketListener = ({ session }) => {
  useSocket(session)
  return null
}

const PlayerStuff = () => {
  return (
    <>
      <FrameSetter />
      <Dashboard />
    </>
  )
}

const DashboardWrapper = ({ isLive = false }) => {
  const ref = useRef()
  const packets = useAtomValue(packetsAtom)
  const playbackRate = useAtomValue(playbackRateAtom)
  const { width, height } = useViewportSize()
  const renderPlayPauseButton = useCallback(({ playing }) => {
    return (
      <Flex gap="md" align="center">
        <ActionIcon c="#fff">
          {playing ? <IconPlayerPause /> : <IconPlayerPlay />}
        </ActionIcon>
        {isLive && (
          <Button
            color="red"
            variant="outline"
            size="sm"
            compact
            onClick={(e) => {
              ref.current.seekTo(Infinity)
              setTimeout(() => {
                ref.current.seekTo(ref.current.getCurrentFrame() - FPS * 2)
                ref.current.play()
              }, 1000)
              e.stopPropagation()
            }}
            leftIcon={<IconPoint />}
          >
            Go live
          </Button>
        )}
      </Flex>
    )
  }, [])

  return (
    <Player
      id="dashboard"
      ref={ref}
      component={PlayerStuff}
      controls
      autoPlay
      spaceKeyToPlayOrPause
      durationInFrames={packetsToFrameDuration(packets, isLive)}
      fps={FPS}
      playbackRate={playbackRate}
      compositionWidth={width ? width : 1920}
      compositionHeight={height ? height : 1080}
      clickToPlay={false}
      style={{ width: '100%', height: '100%' }}
      renderPlayPauseButton={renderPlayPauseButton}
    />
  )
}

const Session = () => {
  console.log('SESSION')
  // useCategoriesAndTags()
  const session = useSession()
  const { packets, fetching } = usePackets()

  const isLive = session && !session.end

  return (
    <>
      {!!packets.length && <InitPackets session={session} packets={packets} />}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <LoadingOverlay visible={fetching} />
        <DashboardWrapper isLive={isLive} />
      </div>
      {isLive && <SocketListener session={session} />}
    </>
  )
}

export default Session
