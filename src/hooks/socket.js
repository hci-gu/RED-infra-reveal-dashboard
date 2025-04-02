import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { mapPackets, packetsAtom, traceRoutesAtom } from '../state/packets'
import { pb } from '../state/pocketbase'

const useSetAtom = (anAtom) => {
  const writeOnlyAtom = useMemo(
    () => atom(null, (get, set, x) => set(anAtom, x)),
    [anAtom]
  )
  return useAtom(writeOnlyAtom)[1]
}

let packets = {}
let traceRoutes = {}

export const useSocket = (session) => {
  const setPackets = useSetAtom(packetsAtom)
  const setTraceRoutes = useSetAtom(traceRoutesAtom)
  const memo = useMemo(() => ({ inited: false }), [])

  useEffect(() => {
    const getPackets = async () => {
      let _packets = await pb.collection('packets').getFullList()

      packets = _packets.reduce((acc, curr) => {
        if (traceRoutes[curr.host]) {
          curr.hops = traceRoutes[curr.host].hops
        }

        acc[curr.id] = curr
        return acc
      }, {})

      setPackets(mapPackets(session, Object.values(packets)))
    }
    const getTraceRoutes = async () => {
      const _traces = await pb.collection('traceroutes').getFullList()
      traceRoutes = _traces.reduce((acc, curr) => {
        curr.hops = curr.hops
          .filter((h) => h.latitude !== 0 && h.longitude !== 0)
          .map((h) => {
            const duration =
              h.timings.reduce((acc, curr) => acc + curr, 0) / h.timings.length
            return {
              ...h,
              duration,
              lat: h.latitude,
              lon: h.longitude,
            }
          })
        acc[curr.domain] = curr

        return acc
      }, {})

      // create sorted list of hosts with most hops
      const hosts = Object.keys(traceRoutes).sort(
        (a, b) => traceRoutes[b].hops.length - traceRoutes[a].hops.length
      )
      // console.log(
      //   hosts
      //     .map((h) => `${traceRoutes[h].domain}: ${traceRoutes[h].hops.length}`)
      //     .join('\n')
      // )

      setTraceRoutes(Object.values(traceRoutes))
    }

    getTraceRoutes().then(() => getPackets())
    return () => {
      setPackets([])
      setTraceRoutes([])
    }
  }, [])

  useEffect(() => {
    if (memo.inited) return
    if (!session || !session.active) return
    memo.inited = true

    pb.collection('packets').subscribe('*', ({ action, record }) => {
      if (action === 'create' || action === 'update') {
        if (traceRoutes[record.host]) {
          record.hops = traceRoutes[record.host].hops
        }
        packets[record.id] = record
      }
    })
    pb.collection('traceroutes').subscribe('*', ({ action, record }) => {
      if (action === 'create' || action === 'update') {
        const trace = {
          ...record,
          hops: record.hops
            .filter((h) => h.latitude !== 0 && h.longitude !== 0)
            .map((h) => ({
              ...h,
              lat: h.latitude,
              lon: h.longitude,
            })),
        }
        traceRoutes[record.domain] = trace
        packets = Object.values(packets).reduce((acc, curr) => {
          if (traceRoutes[curr.host]) {
            curr.hops = traceRoutes[curr.host].hops
          }

          acc[curr.id] = curr
          return acc
        }, {})
      }
    })

    let interval = setInterval(() => {
      setPackets((_packets) => {
        const minDate = Math.min(
          ..._packets.map((p) => new Date(p.timestamp).valueOf())
        )
        return mapPackets(session, Object.values(packets), minDate)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session, memo])
}
