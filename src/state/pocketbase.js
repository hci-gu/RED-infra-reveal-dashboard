import PocketBase from 'pocketbase'
import { sessionAtom, sessionsAtom } from './sessions'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAtom } from 'jotai'

export const pb = new PocketBase('http://192.168.10.200:8090')
pb.admins.authWithPassword('admin@email.com', 'password123')

export const useSessions = () => {
  const [sessions, setSessions] = useAtom(sessionsAtom)

  useEffect(() => {
    const getSessions = async () => {
      const _sessions = await pb.collection('sessions').getFullList()
      setSessions(_sessions)
    }

    getSessions()
  }, [setSessions])

  return sessions
}

export const useSession = () => {
  const { id } = useParams()
  const [session, setSession] = useAtom(sessionAtom)

  useEffect(() => {
    const getSession = async () => {
      const _session = await pb.collection('sessions').getOne(id)
      setSession(_session)
    }

    getSession()
  }, [id, setSession])

  return session
}

export const stopSesion = (id) => {
  pb.collection('sessions').update(id, { active: false })
}
