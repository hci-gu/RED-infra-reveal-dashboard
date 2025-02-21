import { atom } from 'jotai'
import { dateForFrame, FPS, frameForDate } from '../utils/remotion'
import { getClientColor } from '../utils/color'

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

export const distanceBetweenCoords = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1) // deg2rad below
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

const deterministicRandom = (seed) => {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const mapPackets = (session, packets, existingMinDate) => {
  const minDate = existingMinDate
    ? existingMinDate
    : Math.min(...packets.map((p) => new Date(p.created).valueOf()))
  const someDateInTheFuture = new Date()
  someDateInTheFuture.setDate(someDateInTheFuture.getDate() + 1)

  return packets
    .map((p) => {
      const timestamp = new Date(p.created)
      const closed = p.closed ? new Date(p.closed) : someDateInTheFuture
      const startFrame = frameForDate(minDate, timestamp)
      const clientPos =
        session && session.lon && session.lat
          ? [session.lon, session.lat]
          : [11.91737, 57.69226]

      return {
        id: p.id,
        host: p.host,
        direction: p.direction,
        country: p.country,
        city: p.city,
        clientIp: p.client_ip,
        color: getClientColor(p.client_ip),
        data: p.data.map((d) => ({
          dir: d.dir,
          bytes: d.bytes,
          ts: new Date(d.ts),
          frame: frameForDate(minDate, new Date(d.ts)),
        })),
        incomingBytes: p.data.reduce((acc, curr) => {
          if (curr.dir === 'in') {
            return acc + curr.bytes
          }
          return acc
        }, 0),
        outgoingBytes: p.data.reduce((acc, curr) => {
          if (curr.dir === 'out') {
            return acc + curr.bytes
          }
          return acc
        }, 0),
        pos: [p.lon, p.lat],
        clientPos,
        hops: p.hops ? p.hops : [{ lat: p.lat, lon: p.lon }],
        distance: distanceBetweenCoords(
          p.lat,
          p.lon,
          clientPos[1],
          clientPos[0]
        ),
        timestamp,
        startFrame,
        endFrame: startFrame + 4 * FPS,
        closed,
        closedFrame: frameForDate(minDate, closed),
      }
    })
    .filter((p) => p.pos[0] && p.pos[1])
}

export const tagsAtom = atom([])
export const selectedTagsAtom = atom([])
export const categoriesAtom = atom([])
export const selectedClientsAtom = atom([])
export const selectedCategoryAtom = atom(null)
export const activePacketsToggleAtom = atom(false)

export const apiPackets = atom([])

export const packetsAtom = atom([])
export const traceRoutesAtom = atom([])

export const activeClientsAtom = atom((get) => {
  const packets = get(filteredPacketsAtom).filter((p) => p.active)
  const clients = new Set()

  for (let packet of packets) {
    clients.add(packet.clientIp)
  }

  return Array.from(clients)
})

export const dataAtom = atom((get) => {
  const packets = get(packetsAtom)
  // const minDate = Math.min(...packets.map((p) => new Date(p.created).valueOf()))

  const data = []
  for (let packet of packets) {
    for (let d of packet.data) {
      const rand = deterministicRandom(d.ts.valueOf())
      const displayTilt = d.dir === 'in' ? rand * 30 : rand * -30

      let previousLocation = packet.clientPos
      let startFrame = d.frame
      let totalDuration = 3 * FPS

      let hops = d.dir === 'in' ? packet.hops : packet.hops.slice().reverse()

      for (let hop of hops) {
        const endFrame = startFrame + totalDuration / packet.hops.length
        data.push({
          ...d,
          frame: startFrame,
          endFrame,
          startPos: previousLocation,
          endPos: [hop.lon, hop.lat],
          displayTilt,
          distance: packet.distance,
        })
        previousLocation = [hop.lon, hop.lat]
        startFrame = endFrame
      }
    }
  }

  return data
})

export const frameAtom = atom(0)

export const filteredPacketsAtom = atom((get) => {
  const packets = get(packetsAtom)
  const onlyShowActive = get(activePacketsToggleAtom)
  const clients = get(selectedClientsAtom)
  const tags = get(selectedTagsAtom)
  const frame = get(frameAtom)

  return packets
    .map((p) => {
      p.active = p.startFrame <= frame && p.closedFrame + FPS * 3 >= frame
      return p
    })
    .filter((p) => {
      if (onlyShowActive) {
        return p.active
      }
      return p.startFrame <= frame
    })
    .filter((p) => {
      const tagDomains = tags.reduce((domains, tag) => {
        return [...domains, ...tag.domains]
      }, [])
      return tags.length === 0 || tagDomains.indexOf(p.host) !== -1
    })
    .filter((p) => clients.length === 0 || clients.indexOf(p.clientIp) !== -1)
    .map((p) => {
      p.incomingBytes = p.data.reduce((acc, curr) => {
        if (curr.dir === 'in' && frame >= curr.frame) {
          return acc + curr.bytes
        }
        return acc
      }, 0)
      p.outgoingBytes = p.data.reduce((acc, curr) => {
        if (curr.dir === 'out' && frame >= curr.frame) {
          return acc + curr.bytes
        }
        return acc
      }, 0)
      return p
    })
})

export const clockAtom = atom((get) => {
  const packets = get(packetsAtom)
  const minDate = Math.min(
    ...packets.map((p) => new Date(p.timestamp).valueOf())
  )
  const frame = get(frameAtom)
  return dateForFrame(minDate, frame)
})

export const packetContentSizeAtom = atom((get) => {
  const packets = get(filteredPacketsAtom)

  return packets.reduce((acc, curr) => {
    return acc + curr.incomingBytes + curr.outgoingBytes
  }, 0)
})

export const packetsInTag = (tag, packetsMap) => {
  let found = 0
  tag.domains.forEach((name) => {
    if (packetsMap[name]) {
      found += packetsMap[name]
    }
  })

  return found
}

export const packetsByTag = atom((get) => {
  const packets = get(filteredPacketsAtom)
  const category = get(selectedCategoryAtom)
  const tags = get(tagsAtom).filter(
    (tag) => !category || tag.category?.name === category.name
  )

  if (!tags.length || !packets.length) {
    return [{ type: 'other', value: 100 }]
  }

  const packetsMap = packets.reduce((acc, curr) => {
    const domain = curr.host
    if (acc[domain]) {
      acc[domain] += 1
    } else {
      acc[domain] = 1
    }
    return acc
  }, {})

  const values = tags
    .map((t) => ({
      value: packetsInTag(t, packetsMap),
      type: t.name,
    }))
    .filter((t) => t.value > 0)

  return [
    ...values,
    {
      type: 'other',
      value: packets.length - values.reduce((acc, curr) => acc + curr.value, 0),
    },
  ]
})

export const clientsAtom = atom((get) => {
  const packets = get(packetsAtom)
  const clients = new Set()

  for (let packet of packets) {
    clients.add(packet.clientIp)
  }

  return Array.from(clients)
})
