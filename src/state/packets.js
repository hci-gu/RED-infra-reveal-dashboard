import { atom } from 'jotai'
import {
  dateForFrame,
  FPS,
  frameDuration,
  frameForDate,
} from '../utils/remotion'

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

const distanceBetweenCoords = (lat1, lon1, lat2, lon2) => {
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

export const mapPackets = (session, packets, existingMinDate) => {
  const minDate = existingMinDate
    ? existingMinDate
    : Math.min(...packets.map((p) => new Date(p.timestamp).valueOf()))

  return packets.map((p) => {
    const timestamp = new Date(p.timestamp)
    const startFrame = frameForDate(minDate, timestamp)
    const clientPos =
      session && session.lon && session.lat
        ? [session.lon, session.lat]
        : [11.91737, 57.69226]
    // console.log('clientPos', clientPos)
    return {
      id: p.id,
      ip: p.ip,
      host: p.host,
      protocol: p.protocol,
      method: p.method,
      accept: p.accept,
      country: p.country,
      region: p.region,
      city: p.city,
      userId: p.userId,
      contentLength: p.contentLength,
      responseTime: p.responseTime,
      pos: [p.lon, p.lat],
      clientPos,
      distance: distanceBetweenCoords(p.lat, p.lon, clientPos[1], clientPos[0]),
      timestamp,
      startFrame,
      endFrame: startFrame + 4 * FPS,
    }
  })
}

export const tagsAtom = atom([])
export const selectedTagsAtom = atom([])
export const categoriesAtom = atom([])
export const selectedClientsAtom = atom([])
export const selectedCategoryAtom = atom(null)

export const apiPackets = atom([])

export const packetsAtom = atom([])

export const frameAtom = atom(0)

export const filteredPacketsAtom = atom((get) => {
  const packets = get(packetsAtom)
  const clients = get(selectedClientsAtom)
  const tags = get(selectedTagsAtom)
  const frame = get(frameAtom)

  return packets
    .filter((p) => {
      return p.startFrame <= frame
    })
    .filter((p) => {
      const tagDomains = tags.reduce((domains, tag) => {
        return [...domains, ...tag.domains]
      }, [])
      return tags.length === 0 || tagDomains.indexOf(p.host) !== -1
    })
    .filter((p) => clients.length === 0 || clients.indexOf(p.userId) !== -1)
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
    if (curr.contentLength) {
      return acc + curr.contentLength
    }
    return acc
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
  return Object.keys(
    packets
      .filter((p) => p.userId)
      .reduce((map, packet) => {
        if (!map[packet.userId]) {
          map[packet.userId] = true
        }
        return map
      }, {})
  )
})
