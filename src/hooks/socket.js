import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { mapPackets, packetsAtom } from '../state/packets'
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://192.168.10.200:8090')
pb.admins.authWithPassword('admin@email.com', 'password123')

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
    const getPackets = async () => {
      const packets = await pb.collection('packets').getFullList()
      console.log('packets', packets)
      setPackets(mapPackets(session, packets))
    }

    getPackets()
    return () => setPackets([])
  }, [])

  useEffect(() => {
    if (memo.inited) return
    memo.inited = true

    pb.collection('packets').subscribe('*', ({ action, record }) => {
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
