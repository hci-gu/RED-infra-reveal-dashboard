import React, { useState, useEffect, useCallback } from 'react'
import { DeckGL, OrthographicView, ScatterplotLayer, LineLayer } from 'deck.gl'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from 'd3-force'
import { geoMercator } from 'd3-geo'
import { useAtomValue } from 'jotai'
import { distanceBetweenCoords, traceRoutesAtom } from '../../state/packets'

function NetworkMap({ width = 1200, height = 570 }) {
  const traceroutes = useAtomValue(traceRoutesAtom)
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [simulationFinished, setSimulationFinished] = useState(false)
  const [hoverInfo, setHoverInfo] = useState(null)

  useEffect(() => {
    if (!traceroutes.length) return

    const nodeMap = new Map()
    const builtLinks = []

    // 1) Create a single "origin" node. We'll fix it at the center later.
    const ORIGIN_ID = 'origin'
    nodeMap.set(ORIGIN_ID, {
      id: ORIGIN_ID,
      city: 'Göteborg',
      country: 'Sweden',
      lat: 57.7,
      lon: 11.9,
      // We'll assign x/y/fx/fy after we know the canvas center.
    })

    // 2) For each traceroute, link from the origin node to the first hop
    //    and link consecutive hops.
    traceroutes.forEach((traceroute) => {
      const hops = traceroute.hops
      hops.forEach((hop, i) => {
        if (!nodeMap.has(hop.address)) {
          nodeMap.set(hop.address, {
            id: hop.address,
            city: hop.city,
            country: hop.country,
            lat: hop.latitude,
            lon: hop.longitude,
          })
        }
        if (i === 0) {
          // Link from origin to first hop
          builtLinks.push({
            source: ORIGIN_ID,
            target: hop.address,
          })
        } else {
          const prevHop = hops[i - 1]
          builtLinks.push({
            source: prevHop.address,
            target: hop.address,
          })
        }
      })
    })

    setNodes(Array.from(nodeMap.values()))
    setLinks(builtLinks)
    setSimulationFinished(false)
  }, [traceroutes])

  useEffect(() => {
    if (nodes.length === 0 || links.length === 0) return

    // We create a mercator projection just for an initial guess
    // of positions (optional).
    const projection = geoMercator()
      .center([10, 50]) // roughly center of Europe
      .translate([width / 2, height / 2])
      .scale(150)

    // Convert to a map so we can easily set fx, fy.
    const nodeById = new Map()
    nodes.forEach((node) => {
      const copy = { ...node }
      // If lat/lon available, project them for an initial position
      if (typeof copy.lon === 'number' && typeof copy.lat === 'number') {
        const [x, y] = projection([copy.lon, copy.lat])
        copy.x = x
        copy.y = y
      } else {
        copy.x = width / 2
        copy.y = height / 2
      }
      nodeById.set(copy.id, copy)
    })

    // 3) Identify unique first hops. We'll place them radially around origin.
    //    We do this by looking for links that have "origin" as the source.
    const firstHops = []
    links.forEach((link) => {
      if (link.source === 'origin') {
        firstHops.push(link.target) // store the address
      }
    })
    const uniqueFirstHops = [...new Set(firstHops)]

    // 4) Fix the origin node at the center
    const originNode = nodeById.get('origin')
    if (originNode) {
      originNode.fx = width / 2
      originNode.fy = height / 2
    }

    // 5) Radially place each unique first hop around the origin
    //    at a chosen radius, e.g. 150 pixels from origin.
    const radius = 150
    uniqueFirstHops.forEach((hopId, i) => {
      const hopNode = nodeById.get(hopId)
      if (hopNode) {
        const angle = (2 * Math.PI * i) / uniqueFirstHops.length
        const x = width / 2 + radius * Math.cos(angle)
        const y = height / 2 + radius * Math.sin(angle)
        // Fix them in place by setting fx, fy
        hopNode.fx = x
        hopNode.fy = y
      }
    })

    // Convert links to simulation form
    const simulationLinks = links.map((link) => ({
      source: nodeById.get(link.source),
      target: nodeById.get(link.target),
    }))

    // We still use distanceBetweenCoords for the rest of the layout
    // so that beyond the first hop, the force tries to reflect real distances.
    const scaleFactor = 0.5
    const defaultDistance = 80
    const minDistance = 40
    const maxDistance = 200

    // Convert nodeById map to an array for the simulation
    const nodesCopy = [...nodeById.values()]

    const simulation = forceSimulation(nodesCopy)
      .force(
        'link',
        forceLink(simulationLinks)
          .id((d) => d.id)
          .distance((link) => {
            const { source, target } = link
            // If either node is fixed in place, you might just return
            // a small distance. But let's still do real distance for everything.
            if (
              typeof source.lat === 'number' &&
              typeof source.lon === 'number' &&
              typeof target.lat === 'number' &&
              typeof target.lon === 'number'
            ) {
              const geoDist = distanceBetweenCoords(
                source.lat,
                source.lon,
                target.lat,
                target.lon
              )
              const simDist = Math.max(
                minDistance,
                Math.min(geoDist * scaleFactor, maxDistance)
              )
              return simDist
            }
            return defaultDistance
          })
      )
      .force('charge', forceManyBody().strength(-50))
      .force('center', forceCenter(width / 2, height / 2))

    // Because we have some nodes with fx, fy set,
    // the simulation won't move them from their positions.
    simulation.stop()
    for (let i = 0; i < 300; i++) {
      simulation.tick()
    }

    // Mark all nodes with final x,y
    const allPositionsDefined = nodesCopy.every(
      (n) => typeof n.x === 'number' && typeof n.y === 'number'
    )
    if (allPositionsDefined) {
      setNodes(nodesCopy)
      setSimulationFinished(true)
    }
  }, [nodes, links, width, height])

  const onHoverNode = useCallback((info) => {
    if (info.object) {
      setHoverInfo({
        x: info.x,
        y: info.y,
        object: info.object,
      })
    } else {
      setHoverInfo(null)
    }
  }, [])

  if (!simulationFinished) {
    return <div>Loading schematic network...</div>
  }

  const nodeLayer = new ScatterplotLayer({
    id: 'nodes',
    data: nodes,
    getPosition: (d) => {
      if (typeof d.x === 'number' && typeof d.y === 'number') {
        return [d.x, d.y]
      }
      return [0, 0]
    },
    getRadius: 5,
    getFillColor: [125, 22, 40],
    pickable: true,
    onHover: onHoverNode,
  })

  const linkLayer = new LineLayer({
    id: 'links',
    data: links,
    getSourcePosition: (d) => {
      const sourceNode = nodes.find((n) => n.id === d.source)
      return sourceNode &&
        typeof sourceNode.x === 'number' &&
        typeof sourceNode.y === 'number'
        ? [sourceNode.x, sourceNode.y]
        : [0, 0]
    },
    getTargetPosition: (d) => {
      const targetNode = nodes.find((n) => n.id === d.target)
      return targetNode &&
        typeof targetNode.x === 'number' &&
        typeof targetNode.y === 'number'
        ? [targetNode.x, targetNode.y]
        : [0, 0]
    },
    getColor: [125, 125, 125],
    getWidth: 1,
  })

  return (
    <div style={{ position: 'relative' }}>
      <DeckGL
        views={new OrthographicView()}
        initialViewState={{
          target: [width / 2, height / 2, 0],
          zoom: 2,
          rotationX: 0,
          rotationOrbit: 0,
        }}
        controller={true}
        layers={[linkLayer, nodeLayer]}
        width={width}
        height={height}
        style={{ backgroundColor: '#000' }}
      />
      {hoverInfo && hoverInfo.object && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            left: hoverInfo.x,
            top: hoverInfo.y,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            transform: 'translate(10px, 10px)',
          }}
        >
          <div>
            <strong>{hoverInfo.object.id}</strong>
          </div>
          {hoverInfo.object.city && <div>City: {hoverInfo.object.city}</div>}
          {hoverInfo.object.country && (
            <div>Country: {hoverInfo.object.country}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default NetworkMap
