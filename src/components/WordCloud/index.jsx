import React, { useState } from 'react'
import { Text } from '@visx/text'
import { scaleLog } from '@visx/scale'
import { Wordcloud } from '@visx/wordcloud'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom } from '../../state/packets'
import { useViewportSize } from '@mantine/hooks'
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { Center, Flex } from '@mantine/core'
import { vizColors } from '../../utils/color'

function wordFreq(text) {
  const words = text.split(/\s/)
  const freqMap = {}

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0
    freqMap[w] += 1
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }))
}

const fixedValueGenerator = () => 0.5

function WordCloudComponent({ width, height, packets }) {
  const isLargeScreen = height > 320
  const words = wordFreq(packets.map((p) => p.host).join(' '))
  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: isLargeScreen ? [16, 80] : [8, 40],
  })
  const fontSizeSetter = (datum) => fontScale(datum.value)

  return (
    <div className="wordcloud">
      <Wordcloud
        words={words}
        width={width}
        height={height - 12}
        fontSize={fontSizeSetter}
        font={'Impact'}
        spiral={'rectangular'}
        rotate={0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={vizColors[i % vizColors.length]}
              textAnchor={'middle'}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  )
}

const MemoizedWordCloud = React.memo(WordCloudComponent, (prev, next) => {
  const diff = next.lastUpdate - prev.lastUpdate
  // console.log(diff)
  if (next.packets.length < 100 && diff < 1000) return true
  if (diff < 10000) return true
  return prev.packets.length === next.packets.length
})

export default function WordCloud() {
  const packets = useAtomValue(filteredPacketsAtom)

  if (!packets.length || packets.length === 1)
    return (
      <Flex h="100%" w="100%">
        <Text>No data</Text>
      </Flex>
    )

  return (
    <ParentSize>
      {({ width, height }) => (
        <MemoizedWordCloud
          width={width}
          height={height}
          packets={packets}
          lastUpdate={new Date()}
        />
      )}
    </ParentSize>
  )
}
