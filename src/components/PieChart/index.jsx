import React, { useMemo } from 'react'
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { Pie } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleOrdinal } from '@visx/scale'
import { useAtomValue } from 'jotai'
import { packetsByTag } from '../../state/packets'

const fontSizeForSpace = (percent) => {
  if (percent > 0.25) {
    return 16
  }
  if (percent > 0.15) {
    return 14
  }
  if (percent > 0.05) {
    return 10
  }
  if (percent > 0.03) {
    return 0
  }
}

function PieComponent({ width, height }) {
  const data = useAtomValue(packetsByTag)
  const radius = Math.min(width, height) / 2
  const centerY = width / 2
  const centerX = height / 2
  const pieSortValues = (a, b) => b - a

  const getLetterFrequencyColor = useMemo(
    () =>
      scaleOrdinal({
        domain: data.map((d) => d.type),
        range: [
          'rgba(167, 29, 49,1)',
          'rgba(167, 29, 49,0.8)',
          'rgba(167, 29, 49,0.6)',
          'rgba(167, 29, 49,0.4)',
          'rgba(167, 29, 49,0.2)',
        ],
      }),
    [data]
  )

  return (
    <svg width={width} height={height}>
      <Group top={centerX} left={centerY}>
        <Pie
          data={data}
          pieValue={(d) => d.value}
          pieSortValues={pieSortValues}
          outerRadius={radius}
          padAngle={0.01}
          cornerRadius={4}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const { type } = arc.data
              const [centroidX, centroidY] = pie.path.centroid(arc)
              const percentSpace =
                (arc.endAngle - arc.startAngle) / (2 * Math.PI)
              const arcPath = pie.path(arc)
              const arcFill = getLetterFrequencyColor(type)
              const fontSize = fontSizeForSpace(percentSpace)
              return (
                <g key={`arc-${type}-${index}`}>
                  <path d={arcPath} fill={arcFill} />
                  {fontSize > 0 && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#ffffff"
                      fontSize={fontSize}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {arc.data.type}
                    </text>
                  )}
                </g>
              )
            })
          }}
        </Pie>
      </Group>
    </svg>
  )
}

const PieChart = () => {
  return (
    <ParentSize>
      {({ width, height }) => <PieComponent width={width} height={height} />}
    </ParentSize>
  )
}

export default PieChart
