import { useAtom, useAtomValue } from 'jotai'
import { dataForPacket, frameAtom } from '../../state/packets'
import { scaleLinear } from '@visx/scale'
// import { DefaultNode, Graph } from '@visx/network'

import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { AxisBottom } from '@visx/axis'
import { darkModeAtom, playerRefAtom } from '../../state/app'
import { Line } from '@visx/shape'
import { Drag } from '@visx/drag'
import { useState, useEffect } from 'react'
import NetworkMap from '../NetworkMap'
import { FPS } from '../../utils/remotion'

const SinglePacketTimeline = ({ width, height, packet, padding = 16 }) => {
  const darkMode = useAtomValue(darkModeAtom)
  const playerRef = useAtomValue(playerRefAtom)
  const frame = useAtomValue(frameAtom)
  const color = darkMode ? '#D2D7DF' : '#1F2937'
  let data = dataForPacket(packet)

  // only show dir = 'in'
  data = data.filter((d) => d.dir === 'in')

  const startFrame = Math.min(...data.map((d) => d.frame))
  const endFrame = Math.max(...data.map((d) => d.endFrame))

  const xScale = scaleLinear({
    domain: [startFrame, endFrame],
    range: [padding, width - padding],
  })

  const gap = height / 1.5 / data.length

  // Local state to control the circle's x position in pixels.
  const [dragX, setDragX] = useState(xScale(frame))

  // Update dragX if the frame changes externally.
  useEffect(() => {
    setDragX(xScale(frame))
  }, [frame, xScale])

  useEffect(() => {
    playerRef.current.seekTo(packet.startFrame + FPS)
  }, [packet])

  return (
    <svg width={width} height={height}>
      {/* Render the timeline lines */}
      {data.map((d, i) => (
        <Line
          key={i}
          from={{
            x: xScale(d.frame),
            y: i * gap + padding,
          }}
          to={{
            x: xScale(d.endFrame),
            y: i * gap + padding,
          }}
          stroke={color}
          strokeWidth={1}
          pointerEvents="none"
        />
      ))}

      {/* Drag component for the scrubber circle */}
      <Drag
        x={dragX}
        y={0}
        width={width}
        height={height}
        onDragMove={({ x, dx }) => {
          const newX = x + dx
          setDragX(newX)
          // Convert pixel position back into a frame number.
          let newFrame = Math.round(xScale.invert(newX))
          // Clamp newFrame within the packet's frame range.
          newFrame = Math.max(
            packet.startFrame,
            Math.min(packet.endFrame, newFrame)
          )
          playerRef.current.seekTo(newFrame)
        }}
        onDragEnd={() => {
          // Snap the circle's position to the current frame.
          setDragX(xScale(frame))
        }}
      >
        {({ dragStart, dragMove, dragEnd, isDragging, x, dx }) => {
          const currentX = x + dx
          const circleRadius = 6
          // Position the circle slightly above the axis.
          const circleY = height - padding - circleRadius - 2
          return (
            <g>
              <circle
                cx={currentX}
                cy={circleY}
                r={circleRadius}
                fill={color}
              />
              {/* Transparent hit area for easier dragging */}
              <rect
                x={currentX - 20}
                y={circleY - 20}
                width={40}
                height={40}
                fill="transparent"
                style={{ cursor: 'ew-resize' }}
                onMouseDown={dragStart}
                onMouseMove={dragMove}
                onMouseUp={dragEnd}
                onTouchStart={dragStart}
                onTouchMove={dragMove}
                onTouchEnd={dragEnd}
              />
            </g>
          )
        }}
      </Drag>
      {/* <Graph
        graph={graph}
        top={padding}
        left={padding}
        nodeComponent={({ node: { color } }) =>
          color ? <DefaultNode fill={color} /> : <DefaultNode />
        }
        linkComponent={({ link: { source, target, dashed } }) => (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={2}
            stroke="#999"
            strokeOpacity={0.6}
            strokeDasharray={dashed ? '8,4' : undefined}
          />
        )}
      /> */}

      <AxisBottom
        scale={xScale}
        top={height - padding * 1.5}
        stroke={color}
        strokeWidth={0.5}
        tickFormat={(d) => d}
        tickLabelProps={() => ({
          fill: color,
          fontSize: 9,
          y: 18,
        })}
      />
    </svg>
  )
}

export default function ({ packet }) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <>
          <SinglePacketTimeline width={width} height={height} packet={packet} />
          {/* <NetworkMap
            width={width}
            height={height}
            packet={packet}
            traceroutes={[
              {
                hops: packet.hops,
              },
            ]}
          /> */}
        </>
      )}
    </ParentSize>
  )
}
