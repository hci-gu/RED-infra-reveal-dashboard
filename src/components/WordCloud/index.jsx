import React, { useState } from 'react'
import { Text } from '@visx/text'
import { scaleLog } from '@visx/scale'
import { Wordcloud } from '@visx/wordcloud'
import { useAtomValue } from 'jotai'
import { filteredPacketsAtom } from '../../state/packets'
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern'
import { Flex } from '@mantine/core'
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
        {(cloudWords) => {
          if (!cloudWords.length || (cloudWords.length === 1 && words.length)) {
            const word = words[0]
            return (
              <Text
                fill={vizColors[0]}
                textAnchor={'middle'}
                fontSize={24}
                style={{
                  position: 'relative',
                  overflow: 'visible',
                  zIndex: 100,
                }}
              >
                {word.text}
              </Text>
            )
          }

          return cloudWords.map((w, i) => (
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
        }}
      </Wordcloud>
    </div>
  )
}

export const MemoizedWordCloud = React.memo(
  WordCloudComponent,
  (prev, next) => {
    const diff = next.lastUpdate - prev.lastUpdate
    // console.log(diff)
    if (next.packets.length < 100 && diff < 1000) return true
    if (diff < 10000) return true
    return prev.packets.length === next.packets.length
  }
)

export default function WordCloud() {
  const packets = useAtomValue(filteredPacketsAtom)

  if (!packets.length || packets.length === 1) return null

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
