import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { mapPackets, packetsAtom } from '../state/packets'

const useSetAtom = (anAtom) => {
  const writeOnlyAtom = useMemo(
    () => atom(null, (get, set, x) => set(anAtom, x)),
    [anAtom]
  )
  return useAtom(writeOnlyAtom)[1]
}

export const useSocket = (session) => {
  const setPackets = useSetAtom(packetsAtom)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
    })
    let packetstoUpdate = []
    socket.on('packets', (incomingPackets) => {
      packetstoUpdate = [...packetstoUpdate, ...incomingPackets]
    })
    let interval = setInterval(() => {
      setPackets((packets) => {
        const minDate = Math.min(
          ...packets.map((p) => new Date(p.timestamp).valueOf())
        )
        return [...packets, ...mapPackets(session, packetstoUpdate, minDate)]
      })
      packetstoUpdate = []
    }, 1000)
    return () => {
      socket.close()
      clearInterval(interval)
    }
  }, [])
}
