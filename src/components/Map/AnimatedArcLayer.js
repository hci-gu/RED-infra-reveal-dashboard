import { ArcLayer } from '@deck.gl/layers'
import { useAtomValue } from 'jotai'
import { dataAtom, frameAtom } from '../../state/packets'
import { FPS, timeRangeForFrame } from '../../utils/remotion'

class AnimatedArcLayer extends ArcLayer {
  getShaders() {
    const shaders = super.getShaders()
    shaders.inject = {
      'vs:#decl': `\
uniform vec2 timeRange;
attribute float instanceSourceTimestamp;
attribute float instanceTargetTimestamp;
varying float vTimestamp;
`,
      'vs:#main-end': `\
vTimestamp = mix(instanceSourceTimestamp, instanceTargetTimestamp, segmentRatio);
`,
      'fs:#decl': `\
uniform vec2 timeRange;
varying float vTimestamp;
`,
      'fs:#main-start': `\
if (vTimestamp < timeRange.x || vTimestamp > timeRange.y) {
  discard;
}
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= (vTimestamp - timeRange.x) / (timeRange.y - timeRange.x);
`,
    }
    return shaders
  }

  initializeState() {
    super.initializeState()
    this.getAttributeManager().addInstanced({
      instanceSourceTimestamp: {
        size: 1,
        accessor: 'getSourceTimestamp',
      },
      instanceTargetTimestamp: {
        size: 1,
        accessor: 'getTargetTimestamp',
      },
    })
  }

  draw(params) {
    params.uniforms = Object.assign({}, params.uniforms, {
      timeRange: this.props.timeRange,
    })
    super.draw(params)
  }
}

AnimatedArcLayer.layerName = 'AnimatedArcLayer'
AnimatedArcLayer.defaultProps = {
  getSourceTimestamp: { type: 'accessor', value: 0 },
  getTargetTimestamp: { type: 'accessor', value: 1 },
  timeRange: { type: 'array', compare: true, value: [0, 1] },
}

const multiplierForBytes = (bytes) => {
  if (bytes < 1000) return 0.5
  if (bytes < 10000) return 1
  if (bytes < 100000) return 2
  if (bytes < 1000000) return 3
  return 4
}

const multiplierForDistance = (distance) => {
  if (distance < 500) return 2
  if (distance < 1000) return 1.5
  if (distance < 2000) return 1.25
  return 1
}

const widthForZoom = (zoom) => {
  if (zoom > 5) return 8
  if (zoom > 3) return 3
  if (zoom > 2) return 4
  if (zoom > 1.5) return 5
  return 5
}

const heightForZoom = (zoom) => {
  if (zoom > 5) return 0.15
  if (zoom > 3) return 0.25
  if (zoom > 2) return 0.33
  return 0.5
}

const useAnimatedArcLayer = (data, zoom) => {
  const frame = useAtomValue(frameAtom)

  return new AnimatedArcLayer({
    id: `live-packets`,
    data,
    visible: true,
    pickable: true,
    getSourcePosition: (d) => d.startPos,
    getTargetPosition: (d) => d.endPos,
    getSourceTimestamp: (d) => d.frame,
    getTargetTimestamp: (d) => d.endFrame,
    getTilt: (d) => d.displayTilt,
    getHeight: (d) => heightForZoom(zoom),
    getWidth: (d) => widthForZoom(zoom) * multiplierForBytes(d.bytes),
    timeRange: timeRangeForFrame(frame),
    getSourceColor: (d) => (d.selected ? [0, 255, 0] : [167, 29, 49]),
    getTargetColor: (d) => (d.selected ? [0, 255, 0] : [167, 29, 49]),
  })
}

export default useAnimatedArcLayer
