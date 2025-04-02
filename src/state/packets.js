import { atom } from 'jotai'
import { dateForFrame, FPS, frameForDate } from '../utils/remotion'
import { getClientColor } from '../utils/color'
import { onlyShowSelectedAtom } from './app'

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

      const data = p.data.map((d) => ({
        dir: d.dir,
        bytes: d.bytes,
        ts: new Date(d.ts),
        frame: frameForDate(minDate, new Date(d.ts)),
      }))
      const lastData = data[data.length - 1]

      return {
        id: p.id,
        host: p.host,
        direction: p.direction,
        country: p.country,
        city: p.city,
        clientIp: p.client_ip,
        color: getClientColor(p.client_ip),
        data,
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
        endFrame: lastData.frame + 4 * FPS,
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
export const selectedPacketAtom = atom(null)
export const traceRoutesAtom = atom([])

export const activeClientsAtom = atom((get) => {
  const packets = get(filteredPacketsAtom).filter((p) => p.active)
  const clients = new Set()

  for (let packet of packets) {
    clients.add(packet.clientIp)
  }

  return Array.from(clients)
})

export const dataForPacket = (packet) => {
  const data = []
  for (let d of packet.data) {
    const rand = deterministicRandom(d.ts.valueOf())
    const displayTilt = d.dir === 'in' ? rand * 30 : rand * -30

    let previousLocation = packet.clientPos
    let startFrame = d.frame
    // let totalDuration = 7.5 * FPS

    let hops = d.dir === 'in' ? packet.hops : packet.hops.slice().reverse()

    for (let hop of hops) {
      const hopDurationInMillis = hop.duration
      const hopDurationInFrames = Math.floor((hopDurationInMillis / 1000) * FPS)
      const endFrame = startFrame + hopDurationInFrames
      data.push({
        ...d,
        frame: startFrame,
        endFrame,
        startPos: previousLocation,
        endPos: [hop.lon, hop.lat],
        displayTilt: packet.selected ? 0 : displayTilt,
        distance: packet.distance,
        selected: packet.selected,
      })
      previousLocation = [hop.lon, hop.lat]
      startFrame = endFrame
    }
    data.push({
      ...d,
      frame: startFrame,
      endFrame: startFrame + 4 * FPS,
      startPos: previousLocation,
      endPos: packet.pos,
      displayTilt: packet.selected ? 0 : displayTilt,
      distance: packet.distance,
      selected: packet.selected,
    })
  }
  return data
}

export const dataAtom = atom((get) => {
  const packets = get(filteredPacketsAtom)

  const data = []
  for (let packet of packets) {
    data.push(...dataForPacket(packet))
  }

  return data
})

export const selectedDataAtom = atom((get) => {
  const selectedPacket = get(selectedPacketAtom)

  return selectedPacket ? dataForPacket(selectedPacket) : []
})

export const frameAtom = atom(0)

const frameFraction = FPS / 5
export const frameForSecond = atom((get) => {
  const frame = get(frameAtom)
  return Math.floor(frame / frameFraction) * frameFraction
})

export const filteredPacketsAtom = atom((get) => {
  const selectedPacket = get(selectedPacketAtom)
  const packets = get(packetsAtom)
  const onlyShowActive = get(activePacketsToggleAtom)
  const clients = get(selectedClientsAtom)
  const frame = get(frameForSecond)

  return packets
    .map((p) => {
      p.selected = selectedPacket && selectedPacket.id === p.id
      p.active = p.startFrame <= frame && p.closedFrame + FPS * 3 >= frame
      return p
    })
    .filter((p) => {
      if (onlyShowActive) {
        return p.active
      }
      return p.startFrame <= frame
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

export const clientsAtom = atom((get) => {
  const packets = get(packetsAtom)
  const clients = new Set()

  for (let packet of packets) {
    clients.add(packet.clientIp)
  }

  return Array.from(clients)
})
