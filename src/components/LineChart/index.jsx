import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import {
  filteredPacketsAtom,
  frameAtom,
  packetsAtom,
} from '../../state/packets'
import { scaleLinear } from '@visx/scale'
import { Line, LinePath } from '@visx/shape'
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { curveBasis } from '@visx/curve'
import { dateForFrame } from '../../utils/remotion'
import { AxisBottom } from '@visx/axis'
import { darkModeAtom } from '../../state/app'
import { isLiveAtom } from '../../state/sessions'

const packetsToBuckets = (packets) => {
  const buckets = packets.reduce((acc, curr) => {
    const time = new Date(curr.timestamp)
    const seconds = time.getSeconds()
    const remainder = 10 - (seconds % 10)

    time.setSeconds(seconds + remainder)
    const key = time.toLocaleTimeString()
    if (!acc[key]) {
      acc[key] = {
        value: 1,
        date: time,
      }
    } else {
      acc[key].value++
    }
    return acc
  }, {})

  return Object.keys(buckets)
    .map((time) => ({
      time,
      date: buckets[time].date,
      value: buckets[time].value,
    }))
    .sort((a, b) => a.date - b.date)
}

function extent(values, valueof) {
  let min
  let max
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value
        } else {
          if (min > value) min = value
          if (max < value) max = value
        }
      }
    }
  } else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value
        } else {
          if (min > value) min = value
          if (max < value) max = value
        }
      }
    }
  }
  return [min, max]
}

const FrameLine = ({ height, minDate, xScale, padding, color }) => {
  const frame = useAtomValue(frameAtom)

  return (
    <Line
      from={{
        x: xScale(dateForFrame(minDate, frame)),
        y: padding,
      }}
      to={{
        x: xScale(dateForFrame(minDate, frame)),
        y: height - padding * 2,
      }}
      stroke={color}
      strokeWidth={0.5}
      pointerEvents="none"
      strokeDasharray="5,5"
    />
  )
}

const LineChartComponent = ({ width, height, packets, padding = 16 }) => {
  const darkMode = useAtomValue(darkModeAtom)
  const isLive = useAtomValue(isLiveAtom)
  const color = darkMode ? '#D2D7DF' : '#1F2937'
  const minDate = Math.min(...packets.map((p) => p.timestamp.valueOf()))
  const buckets = packetsToBuckets(packets)
  const xScale = scaleLinear({
    domain: extent(buckets, (d) => d.date.valueOf()),
    range: [padding, width - padding * 2],
  })
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: extent(buckets, (d) => d.value),
        range: [height - padding * 2, padding],
      }),
    [height]
  )

  return (
    <svg width={width} height={height}>
      <LinePath
        stroke="#A71D31"
        strokeWidth={2}
        data={buckets}
        x={(d) => xScale(d.date.valueOf())}
        y={(d) => yScale(d.value)}
        // curve={curveBasis}
      />
      <FrameLine
        xScale={xScale}
        minDate={minDate}
        height={height}
        padding={padding}
        color={color}
      />
      <AxisBottom
        scale={xScale}
        top={height - padding * 2}
        numTicks={10}
        stroke={color}
        strokeWidth={0.5}
        tickFormat={(d) => new Date(d).toTimeString().slice(0, 5)}
        hideTicks
        tickLabelProps={() => ({
          fill: color,
          fontSize: 11,
        })}
      />
    </svg>
  )
}

let timer
const MemoizedLineChart = React.memo(LineChartComponent, (prev, next) => {
  // update at most once per second
  if (timer) return true
  timer = setTimeout(() => {
    timer = null
  }, 1000)
  return false
})

const LineChart = () => {
  const packets = useAtomValue(packetsAtom)

  if (!packets.length) return null

  return (
    <ParentSize>
      {({ width, height }) => (
        <MemoizedLineChart width={width} height={height} packets={packets} />
      )}
    </ParentSize>
  )
}

export default LineChart
