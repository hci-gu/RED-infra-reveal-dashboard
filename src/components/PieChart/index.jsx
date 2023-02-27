import React, { useMemo } from 'react'
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { Pie } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleOrdinal } from '@visx/scale'
import { useAtomValue } from 'jotai'
import { packetsByTag } from '../../state/packets'
import { vizColors } from '../../utils/color'

const fontSizeForSpace = (percent) => {
  if (percent > 0.25) {
    return 20
  }
  if (percent > 0.15) {
    return 18
  }
  if (percent > 0.05) {
    return 15
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
        range: vizColors,
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
          padAngle={0.02}
          cornerRadius={4}
        >
          {(pie) => {
            const arcs = pie.arcs.map((arc, index) => {
              const { type } = arc.data
              const arcPath = pie.path(arc)
              const arcFill = getLetterFrequencyColor(type)
              return (
                <g key={`arc-${type}-${index}`}>
                  <path d={arcPath} fill={arcFill} />
                </g>
              )
            })

            const texts = pie.arcs.map((arc, index) => {
              const [centroidX, centroidY] = pie.path.centroid(arc)
              const percentSpace =
                (arc.endAngle - arc.startAngle) / (2 * Math.PI)
              const fontSize = fontSizeForSpace(percentSpace)
              return (
                <g key={`arc-${arc.data.type}-${index}-text`}>
                  {fontSize > 0 && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#fafafa"
                      fontSize={fontSize}
                      fontWeight="bold"
                      textAnchor="middle"
                      stroke="black"
                      strokeWidth="3.5px"
                      pointerEvents="none"
                      style={{
                        paintOrder: 'stroke',
                      }}
                    >
                      {arc.data.type}
                    </text>
                  )}
                </g>
              )
            })

            return [...arcs, ...texts]
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
