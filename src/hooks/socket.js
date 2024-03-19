import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { mapPackets, packetsAtom } from '../state/packets'
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

const useSetAtom = (anAtom) => {
  const writeOnlyAtom = useMemo(
    () => atom(null, (get, set, x) => set(anAtom, x)),
    [anAtom]
  )
  return useAtom(writeOnlyAtom)[1]
}

export const useSocket = (session) => {
  const setPackets = useSetAtom(packetsAtom)
  const memo = useMemo(() => ({ inited: false }), [])

  useEffect(() => {
    if (memo.inited) return
    memo.inited = true

    pb.collection('packet').subscribe('*', ({ action, record }) => {
      if (action === 'create') {
        setPackets((packets) => {
          const minDate = Math.min(
            ...packets.map((p) => new Date(p.timestamp).valueOf())
          )
          return [
            ...packets,
            ...mapPackets(
              session,
              [
                {
                  timestamp: record.created,
                  ip: '0.0.0.0',
                  responseTime: 1000,
                  ...record,
                },
              ],
              minDate
            ),
          ]
        })
      }
    })

    return () => {}
  }, [memo])
}
