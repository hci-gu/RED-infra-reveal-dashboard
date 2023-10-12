import { ArcLayer } from '@deck.gl/layers'
import { useAtom, useAtomValue } from 'jotai'
import { frameAtom, packetsAtom } from '../../state/packets'
import { timeRangeForFrame } from '../../utils/remotion'

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

const useAnimatedArcLayer = (zoom) => {
  const packets = useAtomValue(packetsAtom)
  const frame = useAtomValue(frameAtom)

  return new AnimatedArcLayer({
    id: `packets`,
    data: packets,
    visible: true,
    pickable: true,
    getSourcePosition: (d) => (d.method === 'GET' ? d.pos : d.clientPos),
    getTargetPosition: (d) => (d.method === 'GET' ? d.clientPos : d.pos),
    getSourceTimestamp: (d) => d.startFrame,
    getTargetTimestamp: (d) => d.endFrame,
    getTilt: (d) => d.displayTilt,
    getHeight: heightForZoom(zoom),
    getWidth: widthForZoom(zoom),
    timeRange: timeRangeForFrame(frame),
    getSourceColor: [167, 29, 49],
    getTargetColor: [167, 29, 49],
  })
}

export default useAnimatedArcLayer
