import React from 'react'
import { Card } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom } from '../../state/packets'

// ----- Visx imports -----
import { BarStackHorizontal } from '@visx/shape'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { Group } from '@visx/group'
import { LegendOrdinal } from '@visx/legend'
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale'
import { withTooltip, Tooltip, defaultStyles } from '@visx/tooltip'

// Tooltip styling
const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'rgba(0,0,0,0.8)',
  color: 'white',
}

// Returns [{ host, incoming, outgoing }, ...]
function groupPacketsByHost(packets) {
  const map = {}
  for (const pkt of packets) {
    const h = pkt.host
    if (!map[h]) {
      map[h] = { host: h, incoming: 0, outgoing: 0 }
    }
    if (pkt.direction === 'incoming') {
      map[h].incoming++
    } else {
      map[h].outgoing++
    }
  }
  return Object.values(map)
}

// A child component that draws the horizontal bar chart of {host, incoming, outgoing}
function BarChartBase({
  packets,
  width = 600,
  height = 400,
  margin = { top: 30, right: 20, bottom: 50, left: 200 },
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  hideTooltip,
  showTooltip,
}) {
  // Aggregate and create chart data, then sort descending by total
  const data = React.useMemo(() => {
    const grouped = groupPacketsByHost(packets).sort(
      (a, b) => b.incoming + b.outgoing - (a.incoming + a.outgoing)
    )

    const MAX_BARS = 40
    return grouped.slice(0, MAX_BARS)
  }, [packets])

  // The two stacked keys
  const keys = ['incoming', 'outgoing']

  // Color scale
  const colorScale = scaleOrdinal({
    domain: keys,
    range: ['#d62728', '#1f77b4'], // red, blue
  })

  // xMax/yMax: the drawable area
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  // We'll scale horizontally from 0..max(incoming+outgoing)
  const maxVal = Math.max(...data.map((d) => d.incoming + d.outgoing))
  const xScale = scaleLinear({
    domain: [0, maxVal],
    nice: true,
    range: [0, xMax],
  })

  // Each host on the Y-axis
  const yScale = scaleBand({
    domain: data.map((d) => d.host),
    padding: 0.2,
    range: [0, yMax],
  })

  let tooltipTimeout

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <BarStackHorizontal
            data={data}
            keys={keys} // ['incoming', 'outgoing']
            y={(d) => d.host}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => {
                  // total for this host (row)
                  const total = bar.bar.data.incoming + bar.bar.data.outgoing

                  // We'll only render the total once, on the "outgoing" segment
                  const isOutgoing = bar.key === 'outgoing'

                  return (
                    <React.Fragment key={`${barStack.index}-${bar.index}`}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                        // ... your tooltip / event handlers here ...
                      />
                      {isOutgoing && (
                        <text
                          x={bar.x + bar.width + 4} // a bit to the right of the bar
                          y={bar.y + bar.height / 2} // vertically centered
                          fill="#fff" // white text
                          fontSize={12}
                          alignmentBaseline="middle"
                        >
                          {total}
                        </text>
                      )}
                    </React.Fragment>
                  )
                })
              )
            }
          </BarStackHorizontal>

          {/* Left axis: list of hosts */}
          <AxisLeft
            scale={yScale}
            hideTicks
            hideAxisLine
            tickValues={yScale.domain()}
            tickLabelProps={() => ({
              fill: '#fff', // white text
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
            })}
          />

          {/* Bottom axis: numeric scale of packets */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickLabelProps={() => ({
              fill: '#fff', // white text
              fontSize: 11,
              textAnchor: 'middle',
            })}
          />
        </Group>
      </svg>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <LegendOrdinal
          scale={colorScale}
          direction="row"
          labelMargin="0 15px 0 0"
          labelProps={{ style: { color: '#fff' } }} // white legend labels
        />
      </div>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key.toUpperCase()}</strong>
          </div>
          <div>{tooltipData.value} packets</div>
          <small>{tooltipData.host}</small>
        </Tooltip>
      )}
    </div>
  )
}

// Wrap the bar chart in withTooltip so it can show tooltips
const BarChart = withTooltip(BarChartBase)

// -----------------------------------------------------------------------------
// The main Hosts component
// -----------------------------------------------------------------------------
function HostsComp({ packets }) {
  const { width, height } = useViewportSize()

  return (
    <Card style={{ height: height - 225, overflow: 'auto' }}>
      {/* Bar chart of aggregated data, descending by total, white text */}
      <BarChart packets={packets} width={width - 600} height={height - 300} />
    </Card>
  )
}

const MemoizedHosts = React.memo(HostsComp, (prev, next) => {
  return prev.packets.length === next.packets.length
})

export default function Hosts() {
  // Read packets from the Jotai atom
  const packets = useAtomValue(filteredPacketsAtom)
  return <MemoizedHosts packets={packets} />
}
