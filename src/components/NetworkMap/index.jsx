import React, { useState, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { dataForPacket, frameAtom } from '../../state/packets'
import { DeckGL, OrthographicView, ScatterplotLayer, LineLayer } from 'deck.gl'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from 'd3-force'
import { FPS } from '../../utils/remotion'

function NetworkMap({ width = 800, height = 400, packet }) {
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [simulationFinished, setSimulationFinished] = useState(false)
  const [frame] = useAtom(frameAtom)

  // 1. Build nodes and links based on the packet’s hop order.
  //    We ignore any geographic information and simply use the order:
  //    origin -> hop1 -> hop2 -> ... -> destination.
  useEffect(() => {
    if (!packet) return

    const nodeMap = new Map()

    // Create a node for each hop.
    const hops = packet.hops || []
    hops.forEach((hop) => {
      if (!nodeMap.has(hop.address)) {
        nodeMap.set(hop.address, { id: hop.address })
      }
    })

    // Build links: origin → first hop, then consecutive hops, then last hop → destination.
    const builtLinks = []
    if (hops.length > 0) {
      // builtLinks.push({ source: 'origin', target: hops[0].address })
      for (let i = 1; i < hops.length; i++) {
        builtLinks.push({
          source: hops[i - 1].address,
          target: hops[i].address,
        })
      }
      // builtLinks.push({
      //   source: hops[hops.length - 1].address,
      //   target: 'destination',
      // })
    } else {
      builtLinks.push({ source: 'origin', target: 'destination' })
    }

    setNodes(Array.from(nodeMap.values()))
    setLinks(builtLinks)
    setSimulationFinished(false)
  }, [packet])

  // 2. Run a force simulation to layout the network and then scale/center it.
  useEffect(() => {
    if (simulationFinished || nodes.length === 0 || links.length === 0) return

    const nodeById = new Map()
    nodes.forEach((n) => nodeById.set(n.id, { ...n }))

    const simulationLinks = links.map((l) => ({
      source: nodeById.get(l.source),
      target: nodeById.get(l.target),
    }))
    const nodesCopy = [...nodeById.values()]

    // 1) Run the force simulation
    const simulation = forceSimulation(nodesCopy)
      .force('link', forceLink(simulationLinks).distance(40))
      .force('charge', forceManyBody().strength(-150))
      .force('center', forceCenter(width / 2, height / 2))

    simulation.stop()
    for (let i = 0; i < 300; i++) {
      simulation.tick()
    }

    // 2) Compute the bounding box of the simulation
    const xs = nodesCopy.map((n) => n.x)
    const ys = nodesCopy.map((n) => n.y)
    const minX = Math.min(...xs) - 16
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys) - 32
    const maxY = Math.max(...ys) + 32
    const graphW = maxX - minX
    const graphH = maxY - minY

    // 3) "Stretch" the layout so it fills width & height
    if (graphW > 0 && graphH > 0) {
      const scaleX = (width - 16) / graphW
      const scaleY = (height - 16) / graphH

      // Move top-left corner of bounding box to (0,0), then scale
      nodesCopy.forEach((n) => {
        n.x = (n.x - minX) * scaleX
        n.y = (n.y - minY) * scaleY
      })
    }

    setNodes(nodesCopy)
    setSimulationFinished(true)
  }, [simulationFinished, nodes, links, width, height])

  // 3. Compute the moving “data flow” position based on the current frame.
  //    We build the ordered path (origin, hops, destination) and then compute the
  //    current segment based on packet.startFrame and packet.endFrame.
  const flowData = useMemo(() => {
    if (!packet) return []

    let flow = []
    let totalDuration = 7.5 * FPS
    for (let data of packet.data) {
      // Build the path ordering.

      const hops =
        data.dir === 'in' ? packet.hops : packet.hops.slice().reverse()
      const path = hops.map((hop) => hop.address)
      const totalSegments = path.length - 1
      if (totalSegments < 1) return []

      // Compute a progress fraction between 0 and 1.
      const endFrame = data.frame + totalDuration
      const denom = endFrame - data.frame
      if (denom <= 0) return []
      let fraction = (frame - data.frame) / denom
      fraction = Math.max(0, Math.min(1, fraction))

      // Determine which segment we’re on and the fractional progress along that segment.
      const scaled = fraction * totalSegments
      const segIndex = Math.floor(scaled)
      const segFraction = scaled - segIndex

      if (segIndex < 0 || segIndex >= totalSegments) return []

      const sourceId = path[segIndex]
      const targetId = path[segIndex + 1]

      const sourceNode = nodes.find((n) => n.id === sourceId)
      const targetNode = nodes.find((n) => n.id === targetId)
      if (!sourceNode || !targetNode) return []

      const x = sourceNode.x + segFraction * (targetNode.x - sourceNode.x)
      const y = sourceNode.y + segFraction * (targetNode.y - sourceNode.y)

      flow.push({ x, y })
    }

    return flow
  }, [packet, frame, nodes])

  // 4. Create DeckGL layers for links, nodes, and the moving flow circle.
  const linkLayer = useMemo(
    () =>
      new LineLayer({
        id: 'links',
        data: links,
        getSourcePosition: (d) => {
          const src = nodes.find((n) => n.id === d.source)
          return src ? [src.x, src.y] : [0, 0]
        },
        getTargetPosition: (d) => {
          const tgt = nodes.find((n) => n.id === d.target)
          return tgt ? [tgt.x, tgt.y] : [0, 0]
        },
        getColor: [150, 150, 150],
        getWidth: 1,
      }),
    [links, nodes]
  )

  const nodeLayer = useMemo(
    () =>
      new ScatterplotLayer({
        id: 'nodes',
        data: nodes,
        getPosition: (d) => [d.x, d.y],
        getRadius: 5,
        getFillColor: [125, 22, 40],
      }),
    [nodes]
  )

  const flowLayer = useMemo(
    () =>
      new ScatterplotLayer({
        id: 'flow',
        data: flowData,
        getPosition: (d) => [d.x, d.y],
        getRadius: 6,
        getFillColor: [0, 255, 0],
        pickable: false,
      }),
    [flowData]
  )

  if (!simulationFinished) {
    return (
      <div style={{ width, height, color: '#fff' }}>Loading network...</div>
    )
  }

  return (
    <DeckGL
      views={new OrthographicView()}
      controller={true}
      layers={[linkLayer, nodeLayer, flowLayer]}
      width={width}
      height={height}
      // style={{ backgroundColor: '#000' }}
      initialViewState={{
        target: [width / 2, height / 2],
        zoom: 0,
      }}
    />
  )
}

export default NetworkMap
